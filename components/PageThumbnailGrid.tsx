"use client";

import { useState } from "react";
import {
  DndContext,
  closestCenter,
  PointerSensor,
  useSensor,
  useSensors,
  type DragEndEvent,
} from "@dnd-kit/core";
import {
  SortableContext,
  arrayMove,
  useSortable,
  rectSortingStrategy,
} from "@dnd-kit/sortable";
import { CSS } from "@dnd-kit/utilities";

export interface PageItem {
  id: string; // stable identifier
  pageNumber: number; // 1-based original page number
  thumbnail?: string; // data URL
}

export interface PageThumbnailGridProps {
  pages: PageItem[];
  onChange: (next: PageItem[]) => void;
}

function SortableThumb({ item, index }: { item: PageItem; index: number }) {
  const { attributes, listeners, setNodeRef, transform, transition, isDragging } =
    useSortable({ id: item.id });
  const style: React.CSSProperties = {
    transform: CSS.Transform.toString(transform),
    transition,
    opacity: isDragging ? 0.5 : 1,
  };
  return (
    <div
      ref={setNodeRef}
      style={style}
      {...attributes}
      {...listeners}
      className="card group relative flex cursor-grab flex-col items-center gap-2 p-3 active:cursor-grabbing"
    >
      <div className="flex h-32 w-full items-center justify-center overflow-hidden rounded-lg bg-gray-100">
        {item.thumbnail ? (
          // eslint-disable-next-line @next/next/no-img-element
          <img
            src={item.thumbnail}
            alt={`Page ${item.pageNumber}`}
            className="max-h-32 w-auto object-contain"
          />
        ) : (
          <span className="text-xs text-gray-400">no preview</span>
        )}
      </div>
      <p className="text-sm font-medium text-ink">Page {item.pageNumber}</p>
      <p className="text-xs text-gray-400">Position {index + 1}</p>
    </div>
  );
}

export default function PageThumbnailGrid({
  pages,
  onChange,
}: PageThumbnailGridProps) {
  const [error, setError] = useState<string | null>(null);
  const sensors = useSensors(
    useSensor(PointerSensor, { activationConstraint: { distance: 4 } })
  );

  function handleDragEnd(event: DragEndEvent) {
    const { active, over } = event;
    if (!over || active.id === over.id) return;
    const oldIndex = pages.findIndex((p) => p.id === active.id);
    const newIndex = pages.findIndex((p) => p.id === over.id);
    if (oldIndex < 0 || newIndex < 0) return;
    onChange(arrayMove(pages, oldIndex, newIndex));
  }

  return (
    <div>
      <DndContext
        sensors={sensors}
        collisionDetection={closestCenter}
        onDragEnd={handleDragEnd}
      >
        <SortableContext items={pages.map((p) => p.id)} strategy={rectSortingStrategy}>
          <div className="grid grid-cols-2 gap-3 sm:grid-cols-3 md:grid-cols-4">
            {pages.map((p, i) => (
              <SortableThumb key={p.id} item={p} index={i} />
            ))}
          </div>
        </SortableContext>
      </DndContext>
      {pages.length > 0 && (
        <button
          type="button"
          onClick={() => {
            try {
              const order = pages.map((p) => p.pageNumber).join(",");
              navigator.clipboard.writeText(order);
              setError(null);
            } catch (e) {
              setError("Could not copy order to clipboard");
            }
          }}
          className="mt-3 text-xs text-brand hover:underline"
        >
          Copy order ({pages.map((p) => p.pageNumber).join(",")})
        </button>
      )}
      {error && <p className="mt-1 text-xs text-red-600">{error}</p>}
    </div>
  );
}
