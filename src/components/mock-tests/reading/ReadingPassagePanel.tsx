"use client";

import { useState } from "react";
import Image from "next/image";
import type { ReadingSection } from "@/features/mock-tests/reading/reading-types";

// Left panel of the exam: the passage, article, paragraphs, or diagram. All
// content is structured data rendered as plain React. Part 3 labels (A to E)
// stay visible so students can match statements to paragraphs.
export function ReadingPassagePanel({ section }: { section: ReadingSection }) {
  const { content, assetUrl } = section;
  const [imageFailed, setImageFailed] = useState(false);

  return (
    <div className="space-y-4">
      {content.passage.instruction ? (
        <p className="text-sm font-medium text-ink/70">
          {content.passage.instruction}
        </p>
      ) : null}

      {content.layout === "diagram" && assetUrl ? (
        imageFailed ? (
          <div className="rounded-2xl border border-ink/10 bg-cream-soft p-6 text-center text-sm text-ink/70">
            <p>The diagram could not be loaded.</p>
            <a
              href={assetUrl}
              target="_blank"
              rel="noopener noreferrer"
              className="mt-2 inline-block font-semibold text-brand underline"
            >
              Open the diagram in a new tab
            </a>
          </div>
        ) : (
          <div className="overflow-hidden rounded-2xl border border-ink/10 bg-white p-2">
            <Image
              src={assetUrl}
              alt={
                content.passage.imageAlt ??
                "Reading part 2 diagram used to answer the questions."
              }
              width={1000}
              height={1400}
              sizes="(max-width: 1024px) 100vw, 50vw"
              className="h-auto w-full rounded-lg"
              onError={() => setImageFailed(true)}
              priority
            />
          </div>
        )
      ) : null}

      {content.passage.blocks.map((block, index) => {
        if (block.type === "labeled") {
          return (
            <div
              key={index}
              className="rounded-2xl border border-ink/10 bg-white p-4 sm:p-5"
            >
              <div className="mb-2 inline-flex h-7 w-7 items-center justify-center rounded-full bg-ink text-sm font-bold text-white">
                {block.label}
              </div>
              <p className="text-sm leading-7 text-ink">{block.text}</p>
            </div>
          );
        }
        return (
          <p key={index} className="text-sm leading-7 text-ink">
            {block.text}
          </p>
        );
      })}
    </div>
  );
}
