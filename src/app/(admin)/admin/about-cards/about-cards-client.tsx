"use client";

import Image from "next/image";
import { useMemo, useState } from "react";
import { useMutation } from "@tanstack/react-query";
import { toast } from "sonner";
import {
  ArrowDown,
  ArrowUp,
  BarChart3,
  Bot,
  Brain,
  Check,
  CheckCircle,
  Code,
  Code2,
  Copy,
  Cpu,
  Database,
  Edit3,
  Eye,
  EyeOff,
  Factory,
  FlaskConical,
  Globe,
  GripVertical,
  Heart,
  Languages,
  LineChart,
  MessageSquare,
  Mic,
  Monitor,
  Phone,
  Plus,
  ShieldCheck,
  Stethoscope,
  Tags,
  Terminal,
  Trash2,
  Users,
  Workflow,
  Wrench,
  X,
} from "lucide-react";
import type { AboutCardRow, AboutHeroRow, AboutSectionRow } from "./page";

type WidgetType = "icon-card" | "profile-card" | "avatar-card";
type LayoutType = "two" | "three" | "four";
type PreviewMode = "desktop" | "mobile";
type EditableCard = AboutCardRow & { meta: Record<string, unknown> | null };
type DraftCard = Omit<EditableCard, "id" | "updated_at"> & { id?: string; updated_at?: string };
type EditableSection = Omit<AboutSectionRow, "id" | "updated_at"> & { id?: string; updated_at?: string };
type SectionGroupKey = string;
type EditableHero = AboutHeroRow;

const ICON_MAP = {
  Brain,
  Tags,
  BarChart3,
  Database,
  ShieldCheck,
  Users,
  Bot,
  Code,
  Terminal,
  Stethoscope,
  Heart,
  Factory,
  Wrench,
  Globe,
  Languages,
  Cpu,
  Workflow,
  CheckCircle,
  MessageSquare,
  LineChart,
  Mic,
  Code2,
  FlaskConical,
};

const ICON_OPTIONS = Object.keys(ICON_MAP);

const FALLBACK_SECTIONS: EditableSection[] = [
  section("company", "/ company", "Built for the messy middle between", "models and ground truth", "", "Tbrain is a data and evaluation partner for teams that need more than generic annotation: expert judgment, managed workflows, and measurable quality.", "icon-card", "three", "#6C3CF4", 10),
  section("value", "/ how we deliver value", "Optimized for", "scaling complexity", "", "Legacy marketplaces break on high-stakes AI work. Tbrain provides verifiable software systems and expert-led loops required for agents to self-improve.", "icon-card", "three", "#6C3CF4", 20),
  section("sample_projects", "/ sample projects", "Programs that turn expertise into", "model signal", "", null, "icon-card", "three", "#10B981", 30),
  section("expertise", "/ technical expertise", "Deep technical expertise across", "hard domains", "", null, "icon-card", "two", "#6C3CF4", 40),
  section("team", "/ team", "The operators behind", "Tbrain programs", "", "Tbrain combines AI training data operators, engineering delivery leaders, and domain experts to build evaluation, annotation, and human-feedback programs for high-stakes AI work.", "profile-card", "two", "#6C3CF4", 50),
  section("experts", "/ expert network", "Domain experts when accuracy depends on depth", "", "", "Tbrain works with specialized contributors across STEM, medical, coding, data science, robotics, and other technical domains where generic labeling teams are not enough.", "avatar-card", "four", "#6C3CF4", 60),
];

export function AboutCardsClient({
  initialRows,
  initialSections,
  initialHero,
  sectionsReady,
  heroReady,
}: {
  initialRows: EditableCard[];
  initialSections: AboutSectionRow[];
  initialHero: AboutHeroRow;
  sectionsReady: boolean;
  heroReady: boolean;
}) {
  const [rows, setRows] = useState(() => sortRows(initialRows));
  const [sections, setSections] = useState(() => normalizeSections(initialSections, !sectionsReady));
  const [hero, setHero] = useState<EditableHero>(() => normalizeHero(initialHero));
  const [selectedGroup, setSelectedGroup] = useState<SectionGroupKey>("company");
  const [previewMode, setPreviewMode] = useState<PreviewMode>("desktop");
  const [previewOpen, setPreviewOpen] = useState(false);
  const [editingHero, setEditingHero] = useState<EditableHero | null>(null);
  const [editingSection, setEditingSection] = useState<EditableSection | null>(null);
  const [editingCard, setEditingCard] = useState<DraftCard | null>(null);
  const [cardTypeTarget, setCardTypeTarget] = useState<EditableSection | null>(null);
  const [draggedId, setDraggedId] = useState<string | null>(null);

  const orderedSections = useMemo(() => [...sections].sort((a, b) => a.display_order - b.display_order), [sections]);
  const grouped = useMemo(() => groupRows(rows, orderedSections), [rows, orderedSections]);

  const saveHeroMutation = useMutation({
    mutationFn: async (item: EditableHero) => {
      const payload = {
        key: "about",
        title_before: item.title_before || null,
        title_highlight: item.title_highlight || null,
        title_after: item.title_after || null,
        description: item.description || null,
        stats: normalizeHeroStats(item.stats),
      };
      const data = await aboutBuilderRequest<{ row: AboutHeroRow }>("saveHero", { item: { ...payload, id: item.id } });
      return normalizeHero(data.row);
    },
    onSuccess: (saved) => {
      setHero(saved);
      setEditingHero(null);
      toast.success("Hero saved");
    },
    onError: (err: Error) => toast.error(err.message || "Save failed"),
  });

  const saveSectionMutation = useMutation({
    mutationFn: async (item: EditableSection) => {
      const payload = {
        group_key: item.group_key,
        eyebrow: item.eyebrow || null,
        title_before: item.title_before || null,
        title_highlight: item.title_highlight || null,
        title_after: item.title_after || null,
        description: item.description || null,
        child_widget_type: item.child_widget_type,
        layout: item.layout,
        accent: item.accent || "#6C3CF4",
        display_order: Number(item.display_order) || 100,
        is_active: item.is_active,
      };
      const data = await aboutBuilderRequest<{ row: AboutSectionRow }>("saveSection", { item: { ...payload, id: item.id } });
      return data.row;
    },
    onSuccess: (saved) => {
      setSections((current) => upsertSection(current.filter((item) => item.id || item.group_key === saved.group_key), saved));
      setEditingSection(null);
      toast.success("Section widget saved");
    },
    onError: (err: Error) => toast.error(err.message || "Save failed"),
  });

  const saveCardMutation = useMutation({
    mutationFn: async (card: DraftCard) => {
      const payload = {
        group_key: card.group_key,
        slug: card.slug || autoSlug(card.title),
        title: card.title,
        label: card.label || null,
        description: card.description || null,
        icon: card.icon || null,
        image_url: card.image_url || null,
        meta: normalizeMeta(card.meta),
        display_order: Number(card.display_order) || 100,
        is_active: card.is_active,
      };
      const data = await aboutBuilderRequest<{ row: EditableCard }>("saveCard", { item: { ...payload, id: card.id } });
      return data.row;
    },
    onSuccess: (saved) => {
      setRows((current) => sortRows(upsertRow(current, saved)));
      setEditingCard(null);
      toast.success("Child widget saved");
    },
    onError: (err: Error) => toast.error(err.message || "Save failed"),
  });

  const deleteCardMutation = useMutation({
    mutationFn: async (card: EditableCard) => {
      await aboutBuilderRequest("deleteCard", { id: card.id });
      return card;
    },
    onSuccess: (deleted) => {
      setRows((current) => current.filter((row) => row.id !== deleted.id));
      toast.success("Child widget deleted");
    },
    onError: (err: Error) => toast.error(err.message || "Delete failed"),
  });

  const deleteSectionMutation = useMutation({
    mutationFn: async (sectionItem: EditableSection) => {
      if (!sectionItem.id) return sectionItem;
      await aboutBuilderRequest("deleteSection", { id: sectionItem.id, groupKey: sectionItem.group_key });
      return sectionItem;
    },
    onSuccess: (deleted) => {
      setSections((current) => current.filter((item) => item.group_key !== deleted.group_key));
      setRows((current) => current.filter((row) => row.group_key !== deleted.group_key));
      if (selectedGroup === deleted.group_key) {
        const next = orderedSections.find((item) => item.group_key !== deleted.group_key);
        setSelectedGroup(next?.group_key ?? "");
      }
      setEditingSection((current) => (current?.group_key === deleted.group_key ? null : current));
      setEditingCard((current) => (current?.group_key === deleted.group_key ? null : current));
      toast.success("Section deleted");
    },
    onError: (err: Error) => toast.error(err.message || "Delete failed"),
  });

  const reorderMutation = useMutation({
    mutationFn: async (nextRows: EditableCard[]) => {
      await aboutBuilderRequest("reorderCards", {
        rows: nextRows.map((row) => ({ id: row.id, display_order: row.display_order })),
      });
    },
    onError: (err: Error) => toast.error(err.message || "Reorder failed"),
  });

  const reorderSectionsMutation = useMutation({
    mutationFn: async (nextSections: EditableSection[]) => {
      await aboutBuilderRequest("reorderSections", {
        sections: nextSections.map((sectionItem) => ({ id: sectionItem.id, display_order: sectionItem.display_order })),
      });
    },
    onError: (err: Error) => toast.error(err.message || "Section reorder failed"),
  });

  const beginCreateCard = (sectionItem: EditableSection, cardType: WidgetType) => {
    setSelectedGroup(sectionItem.group_key);
    setCardTypeTarget(null);
    setEditingCard({
      group_key: sectionItem.group_key,
      slug: "",
      title: "",
      label: cardType === "icon-card" ? "New widget" : "",
      description: "",
      icon: cardType === "icon-card" ? fallbackIcon(sectionItem.group_key) : null,
      image_url: cardType === "icon-card" ? null : "/images/avt-1.png",
      meta: cardType === "profile-card" ? { card_type: cardType, projects: [] } : { card_type: cardType },
      display_order: nextOrder(grouped[sectionItem.group_key] ?? []),
      is_active: true,
    });
  };

  const beginCreateSection = () => {
    const order = orderedSections.reduce((max, sectionItem) => Math.max(max, sectionItem.display_order), 0) + 10;
    const groupKey = `section-${order}`;
    const draft = section(groupKey, "/ new section", "New section", "", "", "Describe this section.", "icon-card", "three", "#6C3CF4", order);
    setSections((current) => [...current, draft]);
    setSelectedGroup(groupKey);
    setEditingSection(draft);
    window.setTimeout(() => {
      document.getElementById(`about-section-${groupKey}`)?.scrollIntoView({ behavior: "smooth", block: "center" });
    }, 50);
  };

  const cancelSectionEdit = () => {
    if (editingSection && !editingSection.id) {
      setSections((current) => current.filter((item) => item.group_key !== editingSection.group_key));
    }
    setEditingSection(null);
  };

  const duplicateCard = (card: EditableCard) => {
    setEditingCard({
      ...card,
      id: undefined,
      updated_at: undefined,
      slug: `${card.slug}-copy`,
      title: `${card.title} copy`,
      meta: normalizeMeta(card.meta),
      display_order: nextOrder(grouped[card.group_key] ?? []),
    });
  };

  const handleDrop = (targetId: string, group: SectionGroupKey) => {
    if (!draggedId || draggedId === targetId) return;
    const groupCards = grouped[group] ?? [];
    const from = groupCards.findIndex((card) => card.id === draggedId);
    const to = groupCards.findIndex((card) => card.id === targetId);
    if (from < 0 || to < 0) return;
    const nextGroup = [...groupCards];
    const [moved] = nextGroup.splice(from, 1);
    nextGroup.splice(to, 0, moved);
    const orderedGroup = nextGroup.map((card, index) => ({ ...card, display_order: (index + 1) * 10 }));
    setRows(sortRows(rows.map((row) => orderedGroup.find((card) => card.id === row.id) ?? row)));
    reorderMutation.mutate(orderedGroup);
    setDraggedId(null);
  };

  const moveCard = (card: EditableCard, direction: "up" | "down") => {
    const group = card.group_key;
    const groupCards = grouped[group] ?? [];
    const from = groupCards.findIndex((item) => item.id === card.id);
    const to = direction === "up" ? from - 1 : from + 1;
    if (from < 0 || to < 0 || to >= groupCards.length) return;
    const nextGroup = [...groupCards];
    const [moved] = nextGroup.splice(from, 1);
    nextGroup.splice(to, 0, moved);
    const orderedGroup = nextGroup.map((item, index) => ({ ...item, display_order: (index + 1) * 10 }));
    setSelectedGroup(group);
    setRows(sortRows(rows.map((row) => orderedGroup.find((item) => item.id === row.id) ?? row)));
    reorderMutation.mutate(orderedGroup);
  };

  const moveSection = (sectionItem: EditableSection, direction: "up" | "down") => {
    const from = orderedSections.findIndex((item) => item.group_key === sectionItem.group_key);
    const to = direction === "up" ? from - 1 : from + 1;
    if (from < 0 || to < 0 || to >= orderedSections.length) return;
    const next = [...orderedSections];
    const [moved] = next.splice(from, 1);
    next.splice(to, 0, moved);
    const ordered = next.map((item, index) => ({ ...item, display_order: (index + 1) * 10 }));
    setSections(ordered);
    setSelectedGroup(sectionItem.group_key);
    reorderSectionsMutation.mutate(ordered);
  };

  const deleteSection = (sectionItem: EditableSection) => {
    const cardCount = grouped[sectionItem.group_key]?.length ?? 0;
    const confirmed = window.confirm(`Delete this section${cardCount ? ` and its ${cardCount} cards` : ""}?`);
    if (!confirmed) return;
    deleteSectionMutation.mutate(sectionItem);
  };

  const focusSection = (groupKey: SectionGroupKey) => {
    setSelectedGroup(groupKey);
    document.getElementById(`about-section-${groupKey}`)?.scrollIntoView({ behavior: "smooth", block: "center" });
  };

  return (
    <div className="relative space-y-5">
      <div className="glass-card p-4">
        <div className="mb-4 flex flex-wrap items-center justify-between gap-3">
          <div>
            <p className="text-xs font-semibold uppercase tracking-[0.18em]" style={{ color: "var(--text-muted)" }}>
              Hero widget
            </p>
            <p className="mt-1 text-sm" style={{ color: "var(--text-secondary)" }}>
              Top headline, description, and stat cards on /about.
            </p>
          </div>
          <button type="button" className="btn-secondary text-sm" onClick={() => setEditingHero(hero)}>
            <Edit3 className="h-4 w-4" /> Edit hero
          </button>
        </div>
        {editingHero ? (
          <HeroEditor
            hero={editingHero}
            saving={saveHeroMutation.isPending}
            onChange={setEditingHero}
            onSave={() => saveHeroMutation.mutate(editingHero)}
            onCancel={() => setEditingHero(null)}
          />
        ) : (
          <HeroPreview hero={hero} />
        )}
      </div>

      <div className="glass-card flex flex-wrap items-start justify-between gap-4 p-4">
        <div>
          <p className="text-xs font-semibold uppercase tracking-[0.18em]" style={{ color: "var(--text-muted)" }}>
            Page outline
          </p>
          <p className="mt-1 text-sm" style={{ color: "var(--text-secondary)" }}>
            Section widgets on the landing preview. Click one to focus it.
          </p>
        </div>
        <div className="flex max-w-4xl flex-wrap items-center gap-2">
          {orderedSections.map((item, index) => (
            <div
              key={item.group_key}
              className="inline-flex items-center gap-1 rounded-xl border p-1 text-xs transition hover:border-[#6C3CF4]"
              style={{
                background: item.group_key === selectedGroup ? "rgba(108, 60, 244, 0.08)" : "white",
                borderColor: item.group_key === selectedGroup ? "#6C3CF4" : "var(--border-default)",
                color: item.group_key === selectedGroup ? "#4f2bd3" : "var(--text-primary)",
              }}
            >
              <button type="button" onClick={() => focusSection(item.group_key)} className="inline-flex items-center gap-2 rounded-lg px-2 py-1.5 text-left">
                <span className="inline-flex h-5 w-5 items-center justify-center rounded-full bg-slate-100 text-[10px] font-semibold">
                  {index + 1}
                </span>
                <span>{item.eyebrow?.replace("/ ", "") || item.group_key}</span>
                <span className="rounded-full bg-slate-100 px-1.5 py-0.5 text-[10px]" style={{ color: "var(--text-muted)" }}>
                  {grouped[item.group_key]?.length ?? 0}
                </span>
              </button>
              <span className="h-5 w-px bg-slate-200" />
              <button type="button" className="rounded-md p-1 hover:bg-slate-100 disabled:opacity-35" title="Move section up" disabled={index === 0 || reorderSectionsMutation.isPending} onClick={() => moveSection(item, "up")}>
                <ArrowUp className="h-3.5 w-3.5" />
              </button>
              <button type="button" className="rounded-md p-1 hover:bg-slate-100 disabled:opacity-35" title="Move section down" disabled={index === orderedSections.length - 1 || reorderSectionsMutation.isPending} onClick={() => moveSection(item, "down")}>
                <ArrowDown className="h-3.5 w-3.5" />
              </button>
              <button type="button" className="rounded-md p-1 text-red-600 hover:bg-red-50 disabled:opacity-35" title="Delete section" disabled={deleteSectionMutation.isPending} onClick={() => deleteSection(item)}>
                <Trash2 className="h-3.5 w-3.5" />
              </button>
            </div>
          ))}
        </div>
        <div className="flex flex-wrap items-center gap-2">
          <button type="button" className="btn-secondary text-sm" onClick={() => setPreviewOpen(true)}>
            <Eye className="h-4 w-4" /> Preview page
          </button>
          <button type="button" className="btn-primary text-sm" onClick={beginCreateSection}>
            <Plus className="h-4 w-4" /> Add section
          </button>
        </div>
      </div>

      {!sectionsReady && (
        <div className="rounded-2xl border border-amber-300 bg-amber-50 p-4 text-sm text-amber-900">
          <strong>Section widgets are in preview-only fallback mode.</strong> Apply `supabase/migrations/018_about_sections.sql` to save section heading/layout changes.
        </div>
      )}

      <div className="overflow-x-auto rounded-2xl border bg-white p-4" style={{ borderColor: "var(--border-default)" }}>
        <div className={previewMode === "mobile" ? "mx-auto min-h-[720px] w-[390px] rounded-[2rem] border bg-white shadow-xl" : "min-h-[720px] w-full min-w-[760px] rounded-2xl bg-white"} style={{ borderColor: "var(--border-subtle)" }}>
          <main className="pb-20 pt-10">
            {orderedSections.map((sectionItem) => (
              <EditableSectionWidget
                key={sectionItem.group_key}
                section={sectionItem}
                cards={grouped[sectionItem.group_key] ?? []}
                editingSection={editingSection?.group_key === sectionItem.group_key ? editingSection : null}
                editingCard={editingCard?.group_key === sectionItem.group_key ? editingCard : null}
                focused={selectedGroup === sectionItem.group_key}
                previewMode={previewMode}
                draggedId={draggedId}
                savingSection={saveSectionMutation.isPending}
                savingCard={saveCardMutation.isPending}
                deletingCard={deleteCardMutation.isPending}
                onFocus={() => setSelectedGroup(sectionItem.group_key)}
                onEditSection={() => setEditingSection(sectionItem)}
                onChangeSection={setEditingSection}
                onCancelSection={cancelSectionEdit}
                onSaveSection={() => editingSection && saveSectionMutation.mutate(editingSection)}
                onHideSection={() => saveSectionMutation.mutate({ ...sectionItem, is_active: false })}
                onShowSection={() => saveSectionMutation.mutate({ ...sectionItem, is_active: true })}
                onCreateCard={() => setCardTypeTarget(sectionItem)}
                onEditCard={setEditingCard}
                onChangeCard={setEditingCard}
                onCancelCard={() => setEditingCard(null)}
                onSaveCard={() => editingCard && saveCardMutation.mutate(editingCard)}
                onDuplicateCard={duplicateCard}
                onMoveCard={moveCard}
                onToggleCardActive={(card) => saveCardMutation.mutate({ ...card, is_active: !card.is_active })}
                onDeleteCard={(card) => window.confirm("Delete this child widget?") && deleteCardMutation.mutate(card)}
                onDragStart={setDraggedId}
                onDragEnd={() => setDraggedId(null)}
                onDrop={(id) => handleDrop(id, sectionItem.group_key)}
              />
            ))}
          </main>
        </div>
      </div>
      {cardTypeTarget && (
        <CardTypeModal
          section={cardTypeTarget}
          onClose={() => setCardTypeTarget(null)}
          onSelect={(cardType) => beginCreateCard(cardTypeTarget, cardType)}
        />
      )}
      {previewOpen && (
        <PagePreviewPanel
          hero={hero}
          sections={orderedSections.filter((sectionItem) => sectionItem.is_active)}
          grouped={grouped}
          mode={previewMode}
          onModeChange={setPreviewMode}
          onClose={() => setPreviewOpen(false)}
        />
      )}
    </div>
  );
}

function PagePreviewPanel({
  hero,
  sections,
  grouped,
  mode,
  onModeChange,
  onClose,
}: {
  hero: EditableHero;
  sections: EditableSection[];
  grouped: Record<SectionGroupKey, EditableCard[]>;
  mode: PreviewMode;
  onModeChange: (mode: PreviewMode) => void;
  onClose: () => void;
}) {
  return (
    <div className="fixed inset-y-4 right-4 z-30 rounded-3xl bg-slate-950/50 p-4 shadow-2xl [left:calc(16rem+1rem)]">
      <div className="flex h-full flex-col overflow-hidden rounded-3xl bg-white shadow-2xl">
        <div className="flex flex-wrap items-center justify-between gap-3 border-b px-4 py-3" style={{ borderColor: "var(--border-default)" }}>
          <div>
            <p className="text-xs font-semibold uppercase tracking-[0.18em]" style={{ color: "var(--text-muted)" }}>
              Live page preview
            </p>
            <p className="text-sm" style={{ color: "var(--text-secondary)" }}>
              Clean /about preview without admin editing controls.
            </p>
          </div>
          <div className="flex items-center gap-2">
            <button type="button" className={mode === "desktop" ? "btn-primary text-xs" : "btn-secondary text-xs"} onClick={() => onModeChange("desktop")}>
              <Monitor className="h-3.5 w-3.5" /> Desktop
            </button>
            <button type="button" className={mode === "mobile" ? "btn-primary text-xs" : "btn-secondary text-xs"} onClick={() => onModeChange("mobile")}>
              <Phone className="h-3.5 w-3.5" /> Mobile
            </button>
            <a href="/about" target="_blank" rel="noreferrer" className="btn-secondary text-xs">
              <Eye className="h-3.5 w-3.5" /> Open /about
            </a>
            <button type="button" className="rounded-full p-2 hover:bg-slate-100" onClick={onClose} title="Close preview">
              <X className="h-5 w-5" />
            </button>
          </div>
        </div>
        <div className="flex-1 overflow-auto bg-slate-100 p-4">
          <div className={mode === "mobile" ? "mx-auto min-h-full w-[390px] overflow-hidden rounded-[2rem] bg-white shadow-xl" : "mx-auto min-h-full max-w-[1440px] overflow-hidden rounded-2xl bg-white shadow-xl"}>
            <main className="pb-24">
              <div className="px-5 pt-16 md:px-8 md:pt-20">
                <HeroPreview hero={hero} />
              </div>
              {sections.map((sectionItem) => (
                <PublicSectionPreview
                  key={sectionItem.group_key}
                  section={sectionItem}
                  cards={(grouped[sectionItem.group_key] ?? []).filter((card) => card.is_active)}
                  mode={mode}
                />
              ))}
            </main>
          </div>
        </div>
      </div>
    </div>
  );
}

function PublicSectionPreview({ section, cards, mode }: { section: EditableSection; cards: EditableCard[]; mode: PreviewMode }) {
  return (
    <section className={`mx-auto mt-20 px-5 ${mode === "mobile" ? "max-w-[390px]" : "max-w-6xl md:px-8"}`}>
      <SectionHeader section={section} />
      <div className={gridClass(section, mode)}>
        {cards.map((card) => (
          <ChildWidgetPreview key={card.id} card={card} section={section} />
        ))}
      </div>
    </section>
  );
}

function EditableSectionWidget(props: {
  section: EditableSection;
  cards: EditableCard[];
  editingSection: EditableSection | null;
  editingCard: DraftCard | null;
  focused: boolean;
  previewMode: PreviewMode;
  draggedId: string | null;
  savingSection: boolean;
  savingCard: boolean;
  deletingCard: boolean;
  onFocus: () => void;
  onEditSection: () => void;
  onChangeSection: (section: EditableSection) => void;
  onCancelSection: () => void;
  onSaveSection: () => void;
  onHideSection: () => void;
  onShowSection: () => void;
  onCreateCard: () => void;
  onEditCard: (card: EditableCard) => void;
  onChangeCard: (card: DraftCard) => void;
  onCancelCard: () => void;
  onSaveCard: () => void;
  onDuplicateCard: (card: EditableCard) => void;
  onMoveCard: (card: EditableCard, direction: "up" | "down") => void;
  onToggleCardActive: (card: EditableCard) => void;
  onDeleteCard: (card: EditableCard) => void;
  onDragStart: (id: string) => void;
  onDragEnd: () => void;
  onDrop: (id: string) => void;
}) {
  const sectionItem = props.section;
  const editingExistingId = props.editingCard?.id;

  return (
    <section id={`about-section-${sectionItem.group_key}`} className={`group/editor relative mx-auto mt-16 px-4 first:mt-0 ${props.previewMode === "mobile" ? "max-w-[390px]" : "max-w-6xl"} ${!sectionItem.is_active ? "opacity-50 grayscale" : ""}`} onClick={props.onFocus}>
      <div className={`absolute -inset-x-2 -inset-y-4 rounded-3xl border transition ${props.focused ? "border-[#6C3CF4]/40 bg-[#6C3CF4]/[0.03]" : "border-transparent group-hover/editor:border-[#6C3CF4]/20"}`} />
      <div className="relative rounded-3xl">
        <SectionToolbar section={sectionItem} onEdit={props.onEditSection} onHide={props.onHideSection} onShow={props.onShowSection} />
        {props.editingSection ? (
          <SectionEditor section={props.editingSection} saving={props.savingSection} onChange={props.onChangeSection} onSave={props.onSaveSection} onCancel={props.onCancelSection} />
        ) : (
          <SectionHeader section={sectionItem} />
        )}
        {!props.editingSection && (
          <div className="mt-6 flex justify-center">
            <button type="button" className="btn-secondary text-sm" onClick={props.onCreateCard}>
              <Plus className="h-4 w-4" /> Add card
            </button>
          </div>
        )}

        <div className={gridClass(sectionItem, props.previewMode)}>
          {props.cards.map((card) =>
            editingExistingId === card.id && props.editingCard ? (
              <ChildWidgetEditor key={card.id} draft={props.editingCard} section={sectionItem} saving={props.savingCard} deleting={props.deletingCard} onChange={props.onChangeCard} onCancel={props.onCancelCard} onSave={props.onSaveCard} onDelete={() => props.onDeleteCard(card)} />
            ) : (
              <ChildWidgetFrame key={card.id} card={card} draggedId={props.draggedId} onEdit={props.onEditCard} onDuplicate={props.onDuplicateCard} onMove={props.onMoveCard} onToggleActive={props.onToggleCardActive} onDelete={props.onDeleteCard} onDragStart={props.onDragStart} onDragEnd={props.onDragEnd} onDrop={props.onDrop}>
                <ChildWidgetPreview card={card} section={sectionItem} />
              </ChildWidgetFrame>
            )
          )}
          {props.editingCard && !props.editingCard.id && <ChildWidgetEditor draft={props.editingCard} section={sectionItem} saving={props.savingCard} deleting={props.deletingCard} onChange={props.onChangeCard} onCancel={props.onCancelCard} onSave={props.onSaveCard} />}
          {!props.editingCard && <AddChildWidgetTile section={sectionItem} onCreate={props.onCreateCard} />}
        </div>
      </div>
    </section>
  );
}

function SectionToolbar({ section, onEdit, onHide, onShow }: { section: EditableSection; onEdit: () => void; onHide: () => void; onShow: () => void }) {
  return (
    <div className="absolute right-4 top-4 z-20 flex items-center gap-1 rounded-full border bg-white/95 p-1 opacity-0 shadow-sm transition group-hover/editor:opacity-100" style={{ borderColor: "var(--border-default)" }}>
      <button type="button" onClick={onEdit} className="rounded-full p-1.5 hover:bg-slate-100" title="Edit section widget"><Edit3 className="h-3.5 w-3.5" /></button>
      <button type="button" onClick={section.is_active ? onHide : onShow} className="rounded-full p-1.5 hover:bg-slate-100" title={section.is_active ? "Hide section" : "Show section"}>{section.is_active ? <Eye className="h-3.5 w-3.5" /> : <EyeOff className="h-3.5 w-3.5" />}</button>
      <button type="button" onClick={onHide} className="rounded-full p-1.5 text-red-600 hover:bg-red-50" title="Remove from public page"><Trash2 className="h-3.5 w-3.5" /></button>
    </div>
  );
}

function CardTypeModal({ section, onClose, onSelect }: { section: EditableSection; onClose: () => void; onSelect: (cardType: WidgetType) => void }) {
  const options: Array<{ type: WidgetType; title: string; description: string }> = [
    { type: "icon-card", title: "Icon card", description: "Icon, label, title, and paragraph like the company/value cards." },
    { type: "profile-card", title: "Large profile card", description: "Avatar, role, long bio, and optional project chips." },
    { type: "avatar-card", title: "Avatar card", description: "Compact centered profile with image, domain label, and short detail." },
  ];

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-slate-950/40 p-4">
      <div className="w-full max-w-4xl rounded-3xl bg-white p-5 shadow-2xl">
        <div className="flex items-start justify-between gap-4">
          <div>
            <h3 className="text-xl font-semibold" style={{ fontFamily: "var(--font-heading)", color: "var(--text-primary)" }}>
              Choose card UI
            </h3>
            <p className="mt-1 text-sm" style={{ color: "var(--text-secondary)" }}>
              New card will be added inside {section.eyebrow || section.group_key}.
            </p>
          </div>
          <button type="button" className="rounded-full p-2 hover:bg-slate-100" onClick={onClose} title="Close">
            <X className="h-5 w-5" />
          </button>
        </div>
        <div className="mt-5 grid gap-4 md:grid-cols-3">
          {options.map((option) => (
            <button
              key={option.type}
              type="button"
              className="rounded-2xl border p-4 text-left transition hover:border-[#6C3CF4] hover:bg-[#6C3CF4]/[0.03]"
              style={{ borderColor: "var(--border-default)" }}
              onClick={() => onSelect(option.type)}
            >
              <div className="pointer-events-none">
                <CardTypePreview type={option.type} section={section} />
                <h4 className="mt-4 font-semibold" style={{ color: "var(--text-primary)" }}>{option.title}</h4>
                <p className="mt-1 text-sm leading-relaxed" style={{ color: "var(--text-secondary)" }}>{option.description}</p>
              </div>
            </button>
          ))}
        </div>
      </div>
    </div>
  );
}

function CardTypePreview({ type, section }: { type: WidgetType; section: EditableSection }) {
  const preview: DraftCard = {
    group_key: section.group_key,
    slug: "preview",
    title: type === "profile-card" ? "Profile name" : type === "avatar-card" ? "Expert name" : "Tbrain builds managed data programs",
    label: type === "avatar-card" ? "Domain" : type === "profile-card" ? "Role / domain" : "Company",
    description: type === "profile-card" ? "Longer bio or profile description appears here." : "Short supporting copy for this card.",
    icon: fallbackIcon(section.group_key),
    image_url: type === "icon-card" ? null : "/images/avt-1.png",
    meta: type === "profile-card" ? { card_type: type, projects: ["Project chip"] } : { card_type: type },
    display_order: 10,
    is_active: true,
  };

  if (type === "profile-card") return <ProfileCard card={preview} />;
  if (type === "avatar-card") return <AvatarCard card={preview} />;
  return <IconCard card={preview} section={section} />;
}

function HeroPreview({ hero }: { hero: EditableHero }) {
  return (
    <div className="rounded-3xl border bg-white px-6 py-10 text-center" style={{ borderColor: "var(--border-subtle)" }}>
      <h2 className="text-4xl font-semibold md:text-6xl" style={{ fontFamily: "var(--font-heading)", color: "var(--text-primary)" }}>
        {hero.title_before}
        {hero.title_highlight ? (
          <>
            {" "}
            <span className="gradient-text">{hero.title_highlight}</span>
          </>
        ) : null}
        {hero.title_after ? ` ${hero.title_after}` : null}
      </h2>
      <p className="mx-auto mt-6 max-w-2xl text-lg leading-relaxed" style={{ color: "var(--text-secondary)" }}>
        {hero.description}
      </p>
      <div className="mx-auto mt-10 grid max-w-4xl grid-cols-2 gap-6 md:grid-cols-4">
        {normalizeHeroStats(hero.stats).map((stat, index) => (
          <div key={`${stat.label}-${index}`} className="glass-card p-6 text-center">
            <div className="text-3xl font-bold text-[#6C3CF4]">
              {stat.value}
              {stat.suffix}
            </div>
            <div className="mt-1 text-sm text-[#78818f]">{stat.label}</div>
          </div>
        ))}
      </div>
    </div>
  );
}

function HeroEditor({
  hero,
  saving,
  onChange,
  onSave,
  onCancel,
}: {
  hero: EditableHero;
  saving: boolean;
  onChange: (hero: EditableHero) => void;
  onSave: () => void;
  onCancel: () => void;
}) {
  const stats = normalizeHeroStats(hero.stats);
  const updateStat = (index: number, patch: Partial<(typeof stats)[number]>) => {
    onChange({ ...hero, stats: stats.map((stat, i) => (i === index ? { ...stat, ...patch } : stat)) });
  };
  const removeStat = (index: number) => {
    onChange({ ...hero, stats: stats.filter((_, i) => i !== index) });
  };
  const addStat = () => {
    onChange({ ...hero, stats: [...stats, { value: 1, suffix: "+", label: "New stat" }] });
  };

  return (
    <div className="rounded-3xl border-2 border-[#6C3CF4] bg-white p-6 shadow-[0_24px_80px_rgba(108,60,244,0.18)]">
      <div className="grid gap-3 md:grid-cols-3">
        <InlineTextarea value={hero.title_before ?? ""} onChange={(value) => onChange({ ...hero, title_before: value })} placeholder="Title before" className="min-h-[72px] text-2xl font-semibold" />
        <InlineTextarea value={hero.title_highlight ?? ""} onChange={(value) => onChange({ ...hero, title_highlight: value })} placeholder="Gradient highlight" className="gradient-text min-h-[72px] text-2xl font-semibold" />
        <InlineTextarea value={hero.title_after ?? ""} onChange={(value) => onChange({ ...hero, title_after: value })} placeholder="Title after" className="min-h-[72px] text-2xl font-semibold" />
      </div>
      <InlineTextarea value={hero.description ?? ""} onChange={(value) => onChange({ ...hero, description: value })} placeholder="Hero description" className="mt-4 min-h-[84px] text-base leading-relaxed" />
      <div className="mt-5 grid gap-3 md:grid-cols-2 lg:grid-cols-4">
        {stats.map((stat, index) => (
          <div key={index} className="rounded-2xl border p-3" style={{ borderColor: "var(--border-default)" }}>
            <div className="grid grid-cols-[1fr_72px] gap-2">
              <input className="input-field" type="number" value={stat.value} onChange={(event) => updateStat(index, { value: Number(event.target.value) || 0 })} />
              <input className="input-field" value={stat.suffix} onChange={(event) => updateStat(index, { suffix: event.target.value })} placeholder="K+" />
            </div>
            <input className="input-field mt-2" value={stat.label} onChange={(event) => updateStat(index, { label: event.target.value })} placeholder="Stat label" />
            <button type="button" className="mt-2 inline-flex items-center gap-1 text-xs text-red-600" onClick={() => removeStat(index)}>
              <Trash2 className="h-3.5 w-3.5" /> Remove stat
            </button>
          </div>
        ))}
      </div>
      <div className="mt-5 flex flex-wrap justify-between gap-2">
        <button type="button" className="btn-secondary text-sm" onClick={addStat}>
          <Plus className="h-4 w-4" /> Add stat
        </button>
        <div className="flex gap-2">
          <button type="button" onClick={onSave} disabled={saving} className="btn-primary text-sm">
            <Check className="h-4 w-4" /> {saving ? "Saving..." : "Save hero"}
          </button>
          <button type="button" onClick={onCancel} className="btn-secondary text-sm">
            <X className="h-4 w-4" /> Cancel
          </button>
        </div>
      </div>
    </div>
  );
}

function SectionHeader({ section }: { section: EditableSection }) {
  return (
    <div className="mx-auto max-w-3xl text-center">
      {section.eyebrow && <p className="font-family_avt text-xs uppercase tracking-[0.2em]" style={{ color: "var(--text-muted)" }}>{section.eyebrow}</p>}
      <h2 className="mt-4 text-3xl font-medium md:text-5xl" style={{ fontFamily: "var(--font-heading)", color: "var(--text-primary)" }}>
        {section.title_before} {section.title_highlight && <span className="gradient-text">{section.title_highlight}</span>} {section.title_after}
      </h2>
      {section.description && <p className="mx-auto mt-5 max-w-2xl text-base leading-relaxed" style={{ color: "var(--text-secondary)" }}>{section.description}</p>}
      {!section.is_active && <span className="mt-4 inline-flex rounded-full bg-slate-900 px-3 py-1 text-xs font-semibold uppercase tracking-wider text-white">Hidden section</span>}
    </div>
  );
}

function SectionEditor({ section, saving, onChange, onSave, onCancel }: { section: EditableSection; saving: boolean; onChange: (section: EditableSection) => void; onSave: () => void; onCancel: () => void }) {
  return (
    <div className="mx-auto max-w-3xl rounded-3xl border-2 border-[#6C3CF4] bg-white p-6 text-center shadow-[0_24px_80px_rgba(108,60,244,0.18)]">
      <div className="mb-4 text-left">
        <label className="text-xs font-semibold uppercase tracking-[0.16em]" style={{ color: "var(--text-muted)" }}>Section key</label>
        <input
          className="input-field mt-1"
          value={section.group_key}
          disabled={Boolean(section.id)}
          onChange={(event) => onChange({ ...section, group_key: autoSlug(event.target.value) })}
          placeholder="section-key"
        />
      </div>
      <InlineInput value={section.eyebrow ?? ""} onChange={(value) => onChange({ ...section, eyebrow: value })} placeholder="/ section eyebrow" className="text-center text-xs font-semibold uppercase tracking-[0.2em]" />
      <div className="mt-4 grid gap-2 md:grid-cols-3">
        <InlineTextarea value={section.title_before ?? ""} onChange={(value) => onChange({ ...section, title_before: value })} placeholder="Title before" className="min-h-[82px] text-center text-2xl font-semibold" />
        <InlineTextarea value={section.title_highlight ?? ""} onChange={(value) => onChange({ ...section, title_highlight: value })} placeholder="Gradient highlight" className="gradient-text min-h-[82px] text-center text-2xl font-semibold" />
        <InlineTextarea value={section.title_after ?? ""} onChange={(value) => onChange({ ...section, title_after: value })} placeholder="Title after" className="min-h-[82px] text-center text-2xl font-semibold" />
      </div>
      <InlineTextarea value={section.description ?? ""} onChange={(value) => onChange({ ...section, description: value })} placeholder="Section description" className="mt-4 min-h-[72px] text-center text-sm leading-relaxed" />
      <div className="mt-4 grid gap-3 text-left md:grid-cols-4">
        <select className="input-field" value={section.child_widget_type} onChange={(event) => onChange({ ...section, child_widget_type: event.target.value as WidgetType })}>
          <option value="icon-card">Icon card list</option>
          <option value="profile-card">Large profile list</option>
          <option value="avatar-card">Avatar profile list</option>
        </select>
        <select className="input-field" value={section.layout} onChange={(event) => onChange({ ...section, layout: event.target.value as LayoutType })}>
          <option value="two">2 columns</option>
          <option value="three">3 columns</option>
          <option value="four">4 columns</option>
        </select>
        <input className="input-field" value={section.accent} onChange={(event) => onChange({ ...section, accent: event.target.value })} placeholder="#6C3CF4" />
        <label className="flex items-center gap-2 rounded-xl border px-3 text-sm" style={{ borderColor: "var(--border-default)", color: "var(--text-primary)" }}>
          <input type="checkbox" checked={section.is_active} onChange={(event) => onChange({ ...section, is_active: event.target.checked })} /> Active
        </label>
      </div>
      <div className="mt-4 flex justify-center gap-2">
        <button type="button" onClick={onSave} disabled={saving} className="btn-primary text-sm"><Check className="h-4 w-4" /> {saving ? "Saving..." : "Save section"}</button>
        <button type="button" onClick={onCancel} className="btn-secondary text-sm"><X className="h-4 w-4" /> Cancel</button>
      </div>
    </div>
  );
}

function ChildWidgetFrame({ card, draggedId, onEdit, onDuplicate, onMove, onToggleActive, onDelete, onDragStart, onDragEnd, onDrop, children }: { card: EditableCard; draggedId: string | null; onEdit: (card: EditableCard) => void; onDuplicate: (card: EditableCard) => void; onMove: (card: EditableCard, direction: "up" | "down") => void; onToggleActive: (card: EditableCard) => void; onDelete: (card: EditableCard) => void; onDragStart: (id: string) => void; onDragEnd: () => void; onDrop: (id: string) => void; children: React.ReactNode }) {
  return (
    <div onDragOver={(event) => event.preventDefault()} onDrop={(event) => { event.preventDefault(); onDrop(card.id); }} className={`group/card relative h-full rounded-3xl transition ${!card.is_active ? "opacity-45 grayscale" : ""} ${draggedId === card.id ? "scale-[0.98] opacity-60" : ""}`}>
      <div className={`absolute -inset-1 rounded-3xl border transition ${draggedId && draggedId !== card.id ? "border-[#6C3CF4]/30 bg-[#6C3CF4]/[0.02]" : "border-transparent group-hover/card:border-[#6C3CF4]/40"}`} />
      <div className="absolute left-3 top-3 z-20 flex items-center gap-1 rounded-full border bg-white/95 p-1 opacity-0 shadow-sm transition group-hover/card:opacity-100 focus-within:opacity-100" style={{ borderColor: "var(--border-default)" }}>
        <button
          type="button"
          draggable
          className="flex h-9 w-9 cursor-grab items-center justify-center rounded-full hover:bg-slate-100 active:cursor-grabbing"
          title="Drag widget"
          onClick={(event) => event.stopPropagation()}
          onDragStart={(event) => {
            event.stopPropagation();
            event.dataTransfer.effectAllowed = "move";
            onDragStart(card.id);
          }}
          onDragEnd={onDragEnd}
        >
          <GripVertical className="h-4 w-4" />
        </button>
        <button type="button" className="flex h-9 w-9 items-center justify-center rounded-full hover:bg-slate-100" title="Move up" onClick={(event) => { event.stopPropagation(); onMove(card, "up"); }}><ArrowUp className="h-4 w-4" /></button>
        <button type="button" className="flex h-9 w-9 items-center justify-center rounded-full hover:bg-slate-100" title="Move down" onClick={(event) => { event.stopPropagation(); onMove(card, "down"); }}><ArrowDown className="h-4 w-4" /></button>
        <button type="button" className="rounded-full p-1.5 hover:bg-slate-100" title="Edit" onClick={(event) => { event.stopPropagation(); onEdit(card); }}><Edit3 className="h-3.5 w-3.5" /></button>
        <button type="button" className="rounded-full p-1.5 hover:bg-slate-100" title="Duplicate" onClick={(event) => { event.stopPropagation(); onDuplicate(card); }}><Copy className="h-3.5 w-3.5" /></button>
        <button type="button" className="rounded-full p-1.5 hover:bg-slate-100" title={card.is_active ? "Hide" : "Show"} onClick={(event) => { event.stopPropagation(); onToggleActive(card); }}>{card.is_active ? <Eye className="h-3.5 w-3.5" /> : <EyeOff className="h-3.5 w-3.5" />}</button>
        <button type="button" className="rounded-full p-1.5 text-red-600 hover:bg-red-50" title="Delete" onClick={(event) => { event.stopPropagation(); onDelete(card); }}><Trash2 className="h-3.5 w-3.5" /></button>
      </div>
      <button type="button" onClick={() => onEdit(card)} className="relative block h-full w-full rounded-3xl text-left focus:outline-none focus:ring-4 focus:ring-[#6C3CF4]/20">{children}</button>
      {!card.is_active && <span className="absolute right-3 top-3 rounded-full bg-slate-900 px-2 py-1 text-[10px] font-semibold uppercase tracking-wider text-white">Hidden</span>}
    </div>
  );
}

function ChildWidgetPreview({ card, section }: { card: EditableCard; section: EditableSection }) {
  const cardType = getCardWidgetType(card, section);
  if (cardType === "profile-card") return <ProfileCard card={card} />;
  if (cardType === "avatar-card") return <AvatarCard card={card} />;
  return <IconCard card={card} section={section} />;
}

function IconCard({ card, section }: { card: DraftCard; section: EditableSection }) {
  const Icon = getIcon(card.icon, fallbackIcon(section.group_key));
  return (
    <article className="h-full rounded-2xl border p-6" style={{ background: "var(--bg-card)", borderColor: "var(--border-subtle)", boxShadow: "var(--shadow-card)" }}>
      <div className="flex items-center gap-3">
        <span className="inline-flex h-12 w-12 items-center justify-center rounded-xl" style={{ backgroundColor: `${section.accent}1A`, color: section.accent }}><Icon className="h-6 w-6" /></span>
        {card.label && <p className="text-xs font-semibold uppercase tracking-[0.18em]" style={{ color: "var(--text-muted)" }}>{card.label}</p>}
      </div>
      <h3 className="mt-5 text-xl font-semibold leading-snug" style={{ fontFamily: "var(--font-heading)", color: "var(--text-primary)" }}>{card.title || "Untitled widget"}</h3>
      <p className="mt-3 text-sm leading-relaxed" style={{ color: "var(--text-secondary)" }}>{card.description}</p>
    </article>
  );
}

function ProfileCard({ card }: { card: DraftCard }) {
  const projects = getStringArray(card.meta?.projects);
  return (
    <article className="h-full rounded-3xl p-6 md:p-8" style={{ background: "var(--bg-card)", border: "1px solid var(--border-subtle)", boxShadow: "var(--shadow-card)" }}>
      <div className="flex items-start gap-5">
        <Image src={card.image_url || "/images/avt-tamle.png"} width={96} height={96} alt={card.title || "Profile"} className="h-24 w-24 rounded-2xl object-cover" />
        <div><p className="text-xs font-semibold uppercase tracking-[0.18em]" style={{ color: "#6C3CF4" }}>{card.label}</p><h3 className="mt-2 text-3xl font-semibold" style={{ fontFamily: "var(--font-heading)", color: "var(--text-primary)" }}>{card.title || "Profile name"}</h3></div>
      </div>
      <p className="mt-6 text-base leading-relaxed" style={{ color: "var(--text-secondary)" }}>{card.description}</p>
      <div className="mt-6 flex flex-wrap gap-2">{projects.map((project) => <span key={project} className="rounded-full px-3 py-1 text-xs font-semibold" style={{ background: "var(--hero-chip-bg)", border: "1px solid var(--hero-chip-border)", color: "var(--text-secondary)" }}>{project}</span>)}</div>
    </article>
  );
}

function AvatarCard({ card }: { card: DraftCard }) {
  return (
    <article className="text-center">
      <Image src={card.image_url || "/images/avt-1.png"} width={128} height={128} alt={card.title || "Expert"} className="mx-auto h-32 w-32 rounded-3xl object-cover" />
      <h4 className="mt-4 text-lg font-semibold" style={{ fontFamily: "var(--font-heading)", color: "var(--text-primary)" }}>{card.title || "Expert name"}</h4>
      <p className="mt-1 text-xs font-semibold uppercase tracking-[0.16em]" style={{ color: "#6C3CF4" }}>{card.label}</p>
      <p className="mt-2 text-sm leading-relaxed" style={{ color: "var(--text-secondary)" }}>{card.description}</p>
    </article>
  );
}

function ChildWidgetEditor({ draft, section, saving, deleting, onChange, onCancel, onSave, onDelete }: { draft: DraftCard; section: EditableSection; saving: boolean; deleting: boolean; onChange: (card: DraftCard) => void; onCancel: () => void; onSave: () => void; onDelete?: () => void }) {
  const cardType = getCardWidgetType(draft, section);
  const isIcon = cardType === "icon-card";
  const isProfile = cardType === "profile-card";
  const projectsText = getStringArray(draft.meta?.projects).join("\n");
  const setCardType = (nextType: WidgetType) => {
    const meta = normalizeMeta(draft.meta);
    onChange({
      ...draft,
      icon: nextType === "icon-card" ? draft.icon ?? fallbackIcon(section.group_key) : draft.icon,
      image_url: nextType === "icon-card" ? draft.image_url : draft.image_url ?? "/images/avt-1.png",
      meta: nextType === "profile-card" ? { ...meta, card_type: nextType, projects: getStringArray(meta.projects) } : { ...meta, card_type: nextType },
    });
  };
  return (
    <article className="relative h-full rounded-2xl border-2 border-[#6C3CF4] bg-white p-6 shadow-[0_24px_80px_rgba(108,60,244,0.18)]">
      <div className="absolute right-3 top-3 z-10 flex items-center gap-1 rounded-full border bg-white p-1 shadow-sm" style={{ borderColor: "var(--border-default)" }}>
        <button type="button" onClick={onSave} disabled={!draft.title.trim() || saving} className="rounded-full p-1.5 text-[#16a34a] hover:bg-green-50" title="Save"><Check className="h-4 w-4" /></button>
        <button type="button" onClick={onCancel} className="rounded-full p-1.5 hover:bg-slate-100" title="Cancel"><X className="h-4 w-4" /></button>
        {onDelete && <button type="button" onClick={onDelete} disabled={deleting} className="rounded-full p-1.5 text-red-600 hover:bg-red-50" title="Delete"><Trash2 className="h-4 w-4" /></button>}
      </div>
      <div className="mb-4 pr-10">
        <select className="input-field" value={cardType} onChange={(event) => setCardType(event.target.value as WidgetType)}>
          <option value="icon-card">Icon card UI</option>
          <option value="profile-card">Large profile card UI</option>
          <option value="avatar-card">Avatar card UI</option>
        </select>
      </div>
      {isIcon ? (
        <div className="space-y-4 pr-10">
          <div className="flex items-center gap-3">
            <select className="h-12 w-12 rounded-xl border bg-[#6C3CF4]/10 text-xs text-[#6C3CF4]" value={draft.icon ?? fallbackIcon(section.group_key)} onChange={(event) => onChange({ ...draft, icon: event.target.value })}>{ICON_OPTIONS.map((name) => <option key={name} value={name}>{name}</option>)}</select>
            <InlineInput value={draft.label ?? ""} onChange={(value) => onChange({ ...draft, label: value })} placeholder="LABEL" className="text-xs font-semibold uppercase tracking-[0.18em]" />
          </div>
          <InlineTextarea value={draft.title} onChange={(value) => onChange({ ...draft, title: value, slug: draft.slug || autoSlug(value) })} placeholder="Widget title" className="min-h-[72px] text-xl font-semibold leading-snug" />
          <InlineTextarea value={draft.description ?? ""} onChange={(value) => onChange({ ...draft, description: value })} placeholder="Widget description" className="min-h-[118px] text-sm leading-relaxed" />
        </div>
      ) : (
        <div className="space-y-4 pr-10">
          <input className="input-field" value={draft.image_url ?? ""} onChange={(event) => onChange({ ...draft, image_url: event.target.value })} placeholder="/images/avt-1.png" />
          <InlineInput value={draft.title} onChange={(value) => onChange({ ...draft, title: value, slug: draft.slug || autoSlug(value) })} placeholder="Profile name" className="text-2xl font-semibold" />
          <InlineInput value={draft.label ?? ""} onChange={(value) => onChange({ ...draft, label: value })} placeholder="Role / domain" className="text-xs font-semibold uppercase tracking-[0.18em]" />
          <InlineTextarea value={draft.description ?? ""} onChange={(value) => onChange({ ...draft, description: value })} placeholder="Bio or title" className="min-h-[110px] text-sm leading-relaxed" />
          {isProfile && <InlineTextarea value={projectsText} onChange={(value) => onChange({ ...draft, meta: { ...normalizeMeta(draft.meta), projects: value.split("\n").map((item) => item.trim()).filter(Boolean) } })} placeholder="Project chips, one per line" className="min-h-[80px] text-xs" />}
        </div>
      )}
      <label className="mt-4 flex items-center gap-2 text-xs" style={{ color: "var(--text-muted)" }}><input type="checkbox" checked={draft.is_active} onChange={(event) => onChange({ ...draft, is_active: event.target.checked })} /> Active</label>
    </article>
  );
}

function AddChildWidgetTile({ section, onCreate }: { section: EditableSection; onCreate: () => void }) {
  return (
    <button type="button" onClick={onCreate} className="flex min-h-[220px] flex-col items-center justify-center rounded-2xl border border-dashed bg-white p-6 text-center transition hover:border-[#6C3CF4] hover:bg-[#6C3CF4]/[0.03]" style={{ borderColor: "var(--border-default)", color: "var(--text-muted)" }}>
      <span className="mb-3 inline-flex h-12 w-12 items-center justify-center rounded-xl bg-[#6C3CF4]/10 text-[#6C3CF4]"><Plus className="h-5 w-5" /></span>
      <span className="text-sm font-semibold" style={{ color: "var(--text-primary)" }}>Add card</span>
      <span className="mt-1 text-xs">Choose a UI type for this card</span>
    </button>
  );
}

function InlineInput({ value, onChange, placeholder, className }: { value: string; onChange: (value: string) => void; placeholder: string; className?: string }) {
  return <input value={value} onChange={(event) => onChange(event.target.value)} placeholder={placeholder} className={`w-full rounded-lg border border-transparent bg-transparent px-2 py-1 outline-none transition focus:border-[#6C3CF4]/40 focus:bg-[#6C3CF4]/[0.03] ${className ?? ""}`} style={{ color: "var(--text-primary)" }} />;
}

function InlineTextarea({ value, onChange, placeholder, className }: { value: string; onChange: (value: string) => void; placeholder: string; className?: string }) {
  return <textarea value={value} onChange={(event) => onChange(event.target.value)} placeholder={placeholder} className={`w-full resize-none rounded-lg border border-transparent bg-transparent px-2 py-1 outline-none transition focus:border-[#6C3CF4]/40 focus:bg-[#6C3CF4]/[0.03] ${className ?? ""}`} style={{ color: "var(--text-primary)" }} />;
}

function section(groupKey: SectionGroupKey, eyebrow: string, titleBefore: string, titleHighlight: string, titleAfter: string, description: string | null, childWidgetType: WidgetType, layout: LayoutType, accent: string, displayOrder: number): EditableSection {
  return { group_key: groupKey, eyebrow, title_before: titleBefore, title_highlight: titleHighlight, title_after: titleAfter, description, child_widget_type: childWidgetType, layout, accent, display_order: displayOrder, is_active: true };
}

function normalizeSections(initial: AboutSectionRow[], useFallback: boolean): EditableSection[] {
  if (useFallback) return FALLBACK_SECTIONS;
  return [...initial].sort((a, b) => a.display_order - b.display_order);
}

function normalizeHero(hero: AboutHeroRow): EditableHero {
  return {
    ...hero,
    title_before: hero.title_before ?? "The improvement layer for",
    title_highlight: hero.title_highlight ?? "agentic AI",
    title_after: hero.title_after ?? "",
    description:
      hero.description ??
      "Expert-validated environments, data, and evaluation programs that make agentic AI measurably better. Run by domain pods built for high-stakes work.",
    stats: normalizeHeroStats(hero.stats),
  };
}

function normalizeHeroStats(value: unknown): Array<{ value: number; suffix: string; label: string }> {
  if (!Array.isArray(value)) return [];
  return value.map((item) => {
    if (!item || typeof item !== "object") return { value: 0, suffix: "", label: "" };
    const stat = item as Record<string, unknown>;
    return {
      value: Number(stat.value) || 0,
      suffix: typeof stat.suffix === "string" ? stat.suffix : "",
      label: typeof stat.label === "string" ? stat.label : "",
    };
  });
}

function upsertSection(sections: EditableSection[], row: AboutSectionRow): EditableSection[] {
  return sections.some((item) => item.group_key === row.group_key)
    ? sections.map((item) => (item.group_key === row.group_key ? row : item))
    : [...sections, row];
}

function gridClass(section: EditableSection, previewMode: PreviewMode) {
  if (section.layout === "two") return `mx-auto mt-12 grid max-w-5xl gap-5 ${previewMode === "mobile" ? "grid-cols-1" : "md:grid-cols-2"}`;
  if (section.layout === "four") return `mx-auto mt-12 grid max-w-5xl gap-5 ${previewMode === "mobile" ? "grid-cols-2" : "sm:grid-cols-2 lg:grid-cols-4"}`;
  return `mx-auto mt-12 grid max-w-5xl gap-5 ${previewMode === "mobile" ? "grid-cols-1" : "md:grid-cols-3"}`;
}

function groupRows(rows: EditableCard[], sections: EditableSection[]) {
  return sections.reduce((acc, sectionItem) => {
    acc[sectionItem.group_key] = rows.filter((row) => row.group_key === sectionItem.group_key).sort((a, b) => a.display_order - b.display_order);
    return acc;
  }, {} as Record<SectionGroupKey, EditableCard[]>);
}

function sortRows(rows: EditableCard[]) {
  return [...rows].sort((a, b) => a.group_key.localeCompare(b.group_key) || a.display_order - b.display_order || a.title.localeCompare(b.title));
}

function upsertRow(rows: EditableCard[], row: EditableCard) {
  return rows.some((item) => item.id === row.id) ? rows.map((item) => (item.id === row.id ? row : item)) : [...rows, row];
}

function getCardWidgetType(card: Pick<DraftCard, "meta">, section: EditableSection): WidgetType {
  const type = normalizeMeta(card.meta).card_type;
  return type === "profile-card" || type === "avatar-card" || type === "icon-card" ? type : section.child_widget_type;
}

function getIcon(icon: string | null | undefined, fallback: keyof typeof ICON_MAP) {
  return ICON_MAP[(icon as keyof typeof ICON_MAP) || fallback] ?? ICON_MAP[fallback];
}

function fallbackIcon(groupKey: string): keyof typeof ICON_MAP {
  if (groupKey === "value") return "Brain";
  if (groupKey === "sample_projects") return "Bot";
  if (groupKey === "expertise") return "CheckCircle";
  return "Factory";
}

function normalizeMeta(value: unknown): Record<string, unknown> {
  return value && typeof value === "object" && !Array.isArray(value) ? (value as Record<string, unknown>) : {};
}

function getStringArray(value: unknown) {
  return Array.isArray(value) ? value.filter((item): item is string => typeof item === "string") : [];
}

function nextOrder(items: Array<{ display_order: number }>) {
  return items.reduce((max, item) => Math.max(max, item.display_order), 0) + 10;
}

function autoSlug(value: string) {
  return value.toLowerCase().replace(/[^a-z0-9\s-]/g, "").trim().replace(/\s+/g, "-").slice(0, 200);
}

async function aboutBuilderRequest<T = { ok: true }>(action: string, payload: Record<string, unknown>) {
  const res = await fetch("/api/admin/about-builder", {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({ action, ...payload }),
  });
  const data = (await res.json().catch(() => ({}))) as T & { error?: string };
  if (!res.ok) throw new Error(data.error || "Save failed");
  return data as T;
}
