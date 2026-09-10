"use client";

import { useMemo, useState } from "react";
import { Combobox } from "@base-ui/react/combobox";
import { Select } from "@base-ui/react/select";
import { Check, ChevronDown, Search } from "lucide-react";

/**
 * The two dropdowns on the catalogue, and why neither is a `<select>` any more.
 *
 * A native select's POPUP is operating-system chrome. No stylesheet reaches it:
 * not the rows, not their spacing, not the typeface, not a count beside a label.
 * Everything the page does — hairlines instead of borders, mono microtype,
 * accent-soft for "this one is on" — stops at the moment the control opens, and
 * a page that spent its whole surface avoiding stock widgets hands the reader
 * one at the only moment they are looking straight at it. That is the whole
 * reason for this file; the closed state was already fine.
 *
 * Base UI, not a hand-rolled listbox and not a new dependency: it is already
 * this repo's primitive layer (`components/ui/{tabs,tooltip,dialog,input}.tsx`
 * all wrap it), and a dropdown is exactly the component people underestimate —
 * roving focus, typeahead, `aria-activedescendant`, focus return on close,
 * dismissal on outside press and Escape, flipping when the viewport runs out.
 * Writing that by hand is how a filter rail ends up unusable by keyboard.
 *
 * Job gets the searchable one and Sort does not: 32 jobs is past the count where
 * scanning beats typing, and 4 sort orders is not.
 */

export interface PickerOption {
  value: string;
  label: string;
  /** Records this option would leave, counted with its own facet lifted. */
  count: number;
}

/**
 * The popup lives in a portal, i.e. as a direct child of `<body>` — outside the
 * `.samples-scope` element that declares every `--sm-*` custom property. Colour
 * would resolve to nothing there, so the class is repeated on the popup itself.
 * It carries variables only, no paint of its own, so this costs nothing.
 */
const POPUP = "samples-scope sm-popup";

export function FacetPicker({
  value,
  options,
  onChange,
  ariaLabel,
  searchPlaceholder,
  emptyText,
}: {
  value: string;
  options: PickerOption[];
  onChange: (value: string) => void;
  ariaLabel: string;
  searchPlaceholder: string;
  emptyText: string;
}) {
  // `Intl.Collator` at `sensitivity: "base"`, so "cook" finds "Cook" and a
  // typed accent is not required to reach an accented label.
  const filter = Combobox.useFilter({ sensitivity: "base" });
  const [query, setQuery] = useState("");

  const items = useMemo(
    () => (query ? options.filter((o) => filter.contains(o.label, query)) : options),
    [options, query, filter],
  );

  /* `items` on the Root is what the generic `Value` is inferred from, and it has
     to agree with what `<Combobox.Item value>` carries. Handing it the option
     OBJECTS while the items carried their `value` string made the two disagree:
     the list highlighted correctly and Enter closed the popup having selected
     nothing, because the emitted value never matched. Values only. */
  const itemValues = useMemo(() => items.map((o) => o.value), [items]);

  const reset = options[0];
  const current = options.find((o) => o.value === value) ?? reset;
  const narrowed = value !== reset?.value;

  return (
    <Combobox.Root
      items={itemValues}
      value={value}
      // Open is NOT controlled here. Base UI closes a single-select combobox on
      // item press by itself; it only stayed up while `items` and the items'
      // own `value` disagreed, because the press then matched nothing to select.
      // Controlling it was a fix for that symptom and would have to be undone.
      onOpenChange={(next) => {
        // A query left behind would reopen the popup already filtered with no
        // visible cause: the input is only mounted while the popup is.
        if (!next) setQuery("");
      }}
      onValueChange={(next) => {
        if (typeof next === "string") onChange(next);
      }}
      onInputValueChange={setQuery}
    >
      <Combobox.Trigger
        aria-label={ariaLabel}
        data-active={narrowed || undefined}
        className="sm-field flex w-full items-center gap-2 rounded-lg py-[7px] pl-2.5 pr-2 text-left text-[12px]"
      >
        <span className="min-w-0 flex-1 truncate">{current?.label}</span>
        <span className="sm-field-count shrink-0 font-mono text-[10px]">{current?.count}</span>
        <ChevronDown className="sm-field-chevron h-3.5 w-3.5 shrink-0" />
      </Combobox.Trigger>

      <Combobox.Portal>
        <Combobox.Positioner sideOffset={6} align="start" className="z-50">
          {/* `--anchor-width` and `--available-height` are set by the
              positioner: the popup matches the trigger exactly and never grows
              past the space left on screen, so a rail near the fold flips and
              shortens instead of being clipped. */}
          <Combobox.Popup
            className={`${POPUP} w-[var(--anchor-width)] overflow-hidden rounded-xl`}
          >
            <div className="sm-popup-search flex items-center gap-2 px-2.5 py-2">
              <Search className="h-3.5 w-3.5 shrink-0" />
              <Combobox.Input
                placeholder={searchPlaceholder}
                className="sm-popup-input w-full bg-transparent text-[12px] outline-none"
              />
            </div>

            <Combobox.Empty className="sm-popup-empty px-2.5 py-6 text-center text-[12px]">
              {emptyText}
            </Combobox.Empty>

            <Combobox.List className="max-h-[min(18rem,var(--available-height))] overflow-y-auto p-1">
              {items.map((o) => (
                <Combobox.Item
                  key={o.value}
                  value={o.value}
                  className="sm-option flex cursor-pointer items-center gap-2 rounded-lg px-2 py-1.5 text-[12px]"
                >
                  <Combobox.ItemIndicator className="flex h-3.5 w-3.5 shrink-0 items-center justify-center">
                    <Check className="h-3 w-3" />
                  </Combobox.ItemIndicator>
                  {/* Holds the indicator's column on every unselected row, so
                      labels share one left edge instead of stepping across as
                      the selection moves. */}
                  {!(o.value === value) && <span aria-hidden className="h-3.5 w-3.5 shrink-0" />}
                  <span className="min-w-0 flex-1 truncate">{o.label}</span>
                  <span className="sm-option-count shrink-0 font-mono text-[10px]">{o.count}</span>
                </Combobox.Item>
              ))}
            </Combobox.List>
          </Combobox.Popup>
        </Combobox.Positioner>
      </Combobox.Portal>
    </Combobox.Root>
  );
}

/**
 * Sort. No search box — four options are read faster than a query is typed —
 * and no count, because a sort order narrows nothing.
 */
export function SortPicker<T extends string>({
  value,
  options,
  onChange,
  ariaLabel,
}: {
  value: T;
  options: readonly { key: T; label: string }[];
  onChange: (value: T) => void;
  ariaLabel: string;
}) {
  const current = options.find((o) => o.key === value);

  return (
    <Select.Root
      value={value}
      onValueChange={(next) => {
        if (typeof next === "string") onChange(next as T);
      }}
    >
      <Select.Trigger
        aria-label={ariaLabel}
        className="sm-field flex items-center gap-2 rounded-lg py-[7px] pl-2.5 pr-2 text-[12px]"
      >
        <span className="truncate">{current?.label}</span>
        <ChevronDown className="sm-field-chevron h-3.5 w-3.5 shrink-0" />
      </Select.Trigger>

      <Select.Portal>
        <Select.Positioner sideOffset={6} align="end" className="z-50">
          <Select.Popup className={`${POPUP} min-w-[var(--anchor-width)] overflow-hidden rounded-xl p-1`}>
            {options.map((o) => (
              <Select.Item
                key={o.key}
                value={o.key}
                className="sm-option flex cursor-pointer items-center gap-2 rounded-lg px-2 py-1.5 text-[12px]"
              >
                <Select.ItemIndicator className="flex h-3.5 w-3.5 shrink-0 items-center justify-center">
                  <Check className="h-3 w-3" />
                </Select.ItemIndicator>
                {o.key !== value && <span aria-hidden className="h-3.5 w-3.5 shrink-0" />}
                <Select.ItemText className="truncate">{o.label}</Select.ItemText>
              </Select.Item>
            ))}
          </Select.Popup>
        </Select.Positioner>
      </Select.Portal>
    </Select.Root>
  );
}
