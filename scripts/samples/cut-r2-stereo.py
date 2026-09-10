"""Cut both eyes of every published stereo record, at the same instant.

The catalogue shipped 118 stereo records previewed as ONE eye, on a page whose
whole pitch is "two synchronised eyes ... true depth, not a single RGB feed".
The right eyes were never staged: `index-stereo.mjs` said so at the time —
"the deliveries are not in this repo" — and they are not on anybody's laptop
either.

They are in R2. Not as MCAP, which would need a chunk-index reader: the
pipeline already exports plain per-camera mp4 beside every session, and a
_proxy variant at a quarter the bytes.

    derived/<date>/<capture>/full/primary_left.mp4        2892 MB
    derived/<date>/<capture>/full/primary_left_proxy.mp4   638 MB
    derived/<date>/<capture>/full/primary_right{,_proxy}.mp4
    derived/<date>/<capture>/full/mid_{left,right}{,_proxy}.mp4

So this is the same range read the Drive cutter does — `-ss` before `-i` so
ffmpeg seeks instead of decoding from zero, and eight seconds out of a 638 MB
proxy moves a few megabytes. 110 records, both eyes, in about six minutes.

## Why the left eye is re-cut and not reused

Nobody knows what second the published left clip was taken at. Pairing a new
right eye with it would put two different moments side by side and sell the
difference as parallax, which is the one thing a stereo card must not do. Both
eyes are cut from the same timestamp, so the offset between them is the rig's.

## The map

Built off the production database — read-only, no writes anywhere:

    with want(slug,task,seg,dur) as (values ...)   -- from samples.json:
                                                   -- Task id, seg from File, durationSec
    select w.slug||'|'||s.r2_derived_prefix||'|'
        ||round((e.start_unix - extract(epoch from s.recorded_at))::numeric,2)||'|'
        ||round(s.duration_s::numeric,1)||'|'||round((e.end_unix-e.start_unix)::numeric,1)
    from want w
    join lateral (
      select e2.* from oai.episodes e2 join oai.sessions s2 using (session_id)
      where e2.task_id=w.task and e2.seg_idx=w.seg
        and abs(e2.hours*3600 - w.dur) < 1.5
        and s2.r2_derived_prefix is not null
        and e2.start_unix >= extract(epoch from s2.recorded_at) - 5
        and e2.end_unix   <= extract(epoch from s2.recorded_at) + s2.duration_s + 5
      order by e2.created_at limit 1
    ) e on true
    left join oai.sessions s using (session_id) order by w.slug;

The `SHA-256` row in a record does NOT join to `episodes.content_hash` —
zero of 118 match, they are hashes of different things. Task, segment index and
duration do. The session time-window clause is what drops 8 of the 118: without
it the lateral happily matches an episode to a session on another day and hands
back an offset thirteen hours into a two-hour video.

## Running it

On the box, because that is where the credentials and ffmpeg are. Writes only
into /tmp/stereo-out; scp the result into public/samples/.

    scp scripts/samples/cut-r2-stereo.py tbrain_agent_2:/tmp/
    ssh tbrain_agent_2 'python3 /tmp/cut-r2-stereo.py /tmp/map.txt'
    ssh tbrain_agent_2 'FLIP=1 python3 /tmp/cut-r2-stereo.py /tmp/flip-map.txt'

FLIP=1 turns the cut 180 degrees, for the sessions whose rig build records
upside down. Which ones those are is not guessable from the file — no rotate
tag, no display matrix — so `check-orientation.mjs` decides it by matching
against the clip already published for the same record.
"""
import concurrent.futures as cf, datetime, hashlib, hmac, os, re, subprocess, sys, urllib.parse, urllib.request

OUT = "/tmp/stereo-out"
W, H, SECONDS = 576, 432, 8
# Left eye first: the pair is named for it, and a session that has no primary
# pair falls back to the mid one rather than mixing a primary left with a mid
# right, which would be two cameras at different baselines sold as a pair.
PAIRS = [("primary_left_proxy", "primary_right_proxy"),
         ("primary_left", "primary_right"),
         ("mid_left_proxy", "mid_right_proxy"),
         ("mid_left", "mid_right")]

def creds():
    out = subprocess.run(["docker", "exec", "oai-backend-worker-1", "printenv"],
                         capture_output=True, text=True, check=True).stdout
    env = dict(l.split("=", 1) for l in out.splitlines() if "=" in l)
    return (env["R2_ACCESS_KEY_ID"], env["R2_SECRET_ACCESS_KEY"],
            env["R2_ENDPOINT"].rstrip("/"), env["OAI_R2_BUCKET"])

AK, SK, ENDPOINT, BUCKET = creds()
HOST = urllib.parse.urlparse(ENDPOINT).netloc
def _s(key, msg): return hmac.new(key, msg.encode(), hashlib.sha256).digest()

def presign(key, expires=7200):
    t = datetime.datetime.now(datetime.timezone.utc)
    amzdate, datestamp = t.strftime("%Y%m%dT%H%M%SZ"), t.strftime("%Y%m%d")
    scope = f"{datestamp}/auto/s3/aws4_request"
    path = "/" + BUCKET + "/" + urllib.parse.quote(key)
    q = {"X-Amz-Algorithm": "AWS4-HMAC-SHA256", "X-Amz-Credential": f"{AK}/{scope}",
         "X-Amz-Date": amzdate, "X-Amz-Expires": str(expires), "X-Amz-SignedHeaders": "host"}
    cq = "&".join(f"{urllib.parse.quote(k,'')}={urllib.parse.quote(v,'')}" for k, v in sorted(q.items()))
    canon = f"GET\n{path}\n{cq}\nhost:{HOST}\n\nhost\nUNSIGNED-PAYLOAD"
    sts = f"AWS4-HMAC-SHA256\n{amzdate}\n{scope}\n{hashlib.sha256(canon.encode()).hexdigest()}"
    k = _s(_s(_s(_s(("AWS4"+SK).encode(), datestamp), "auto"), "s3"), "aws4_request")
    return f"{ENDPOINT}{path}?{cq}&X-Amz-Signature={hmac.new(k, sts.encode(), hashlib.sha256).hexdigest()}"

def sign_get(path, query):
    """A signed GET, headers in the signature. Used for ListObjectsV2."""
    t = datetime.datetime.now(datetime.timezone.utc)
    amzdate, datestamp = t.strftime("%Y%m%dT%H%M%SZ"), t.strftime("%Y%m%d")
    payload = hashlib.sha256(b"").hexdigest()
    cq = "&".join(f"{urllib.parse.quote(k,'')}={urllib.parse.quote(str(v),'')}"
                  for k, v in sorted(query.items()))
    canon = (f"GET\n{path}\n{cq}\nhost:{HOST}\nx-amz-content-sha256:{payload}\n"
             f"x-amz-date:{amzdate}\n\nhost;x-amz-content-sha256;x-amz-date\n{payload}")
    scope = f"{datestamp}/auto/s3/aws4_request"
    sts = f"AWS4-HMAC-SHA256\n{amzdate}\n{scope}\n{hashlib.sha256(canon.encode()).hexdigest()}"
    k = _s(_s(_s(_s(("AWS4"+SK).encode(), datestamp), "auto"), "s3"), "aws4_request")
    sig = hmac.new(k, sts.encode(), hashlib.sha256).hexdigest()
    req = urllib.request.Request(f"{ENDPOINT}{path}?{cq}")
    req.add_header("x-amz-date", amzdate)
    req.add_header("x-amz-content-sha256", payload)
    req.add_header("Authorization", "AWS4-HMAC-SHA256 Credential="
                   f"{AK}/{scope}, SignedHeaders=host;x-amz-content-sha256;x-amz-date, Signature={sig}")
    return urllib.request.urlopen(req, timeout=60).read().decode()

def listing(prefix):
    """The camera files a session actually has. A presigned HEAD cannot answer
       this: SigV4 signs the method, so a GET signature sent as HEAD is a
       mismatch and every probe comes back missing."""
    xml = sign_get(f"/{BUCKET}", {"list-type": "2", "prefix": prefix, "max-keys": "200"})
    return set(re.findall(r"<Key>(.*?)</Key>", xml))

def seek_in_episode(dur):
    """Same rule as the Drive cutter: a little way in, never past the end."""
    if not dur or dur <= SECONDS:
        return 0.0
    return min(dur * 0.3, max(0.0, dur - SECONDS - 1), 45.0)

FLIP = os.environ.get("FLIP") == "1"

def cut(key, seek, out):
    subprocess.run(["ffmpeg", "-y", "-v", "error", "-ss", f"{seek:.2f}", "-i", presign(key),
                    "-t", str(SECONDS), "-an",
                    "-vf", f"{'hflip,vflip,' if FLIP else ''}scale={W}:{H}:force_original_aspect_ratio=increase,crop={W}:{H}",
                    "-c:v", "libx264", "-preset", "veryfast", "-crf", "28",
                    "-movflags", "+faststart", out], check=True,
                   stdout=subprocess.DEVNULL, stderr=subprocess.PIPE)
    subprocess.run(["ffmpeg", "-y", "-v", "error", "-ss", "0.5", "-i", out,
                    "-frames:v", "1", "-q:v", "4", out[:-4] + ".jpg"], check=True,
                   stdout=subprocess.DEVNULL, stderr=subprocess.PIPE)

def job(line):
    slug, prefix, off, sdur, edur = line.split("|")
    off, edur = float(off), float(edur)
    seek = off + seek_in_episode(edur)
    have = listing(f"{prefix}full/")
    for left, right in PAIRS:
        lk, rk = f"{prefix}full/{left}.mp4", f"{prefix}full/{right}.mp4"
        if not (lk in have and rk in have):
            continue
        try:
            cut(lk, seek, f"{OUT}/{slug}.mp4")
            cut(rk, seek, f"{OUT}/{slug}-right.mp4")
            return f"ok   {slug:<26} {left.split('_')[0]:<8} @{seek:8.2f}s"
        except subprocess.CalledProcessError as e:
            return f"FAIL {slug:<26} {e.stderr.decode().strip().splitlines()[-1][:70] if e.stderr else e}"
    return f"MISS {slug:<26} has: " + ",".join(sorted(k.rsplit("/",1)[-1] for k in have)) [:90]

os.makedirs(OUT, exist_ok=True)
lines = [l.strip() for l in open(sys.argv[1]) if l.strip()]
with cf.ThreadPoolExecutor(max_workers=4) as ex:
    for r in ex.map(job, lines):
        print(r, flush=True)
