import { useReadStoreField } from '@/app/features/wording-studio/store';
import { useStudioStore } from './store';
import { useEffect, useState } from 'react';

/**
 * Computes all ancestor paths (including the path itself).
 * E.g., "menu.items.0.text" => ["menu", "menu.items", "menu.items.0", "menu.items.0.text"]
 */
const getAncestorPaths = (path: string): string[] => {
  if (!path) {
    return [];
  }
  const parts = path.split('.');
  const paths: string[] = [];
  let current = '';
  for (const part of parts) {
    current = current ? `${current}.${part}` : part;
    paths.push(current);
  }
  return paths;
};

type FieldPosition = {
  path: string;
  top: number;
  height: number;
  depth: number;
};

/**
 * TreeOverlay renders vertical nesting lines at each indent level when hovering.
 * Lines extend from each ancestor down to the hovered field.
 */
export const TreeOverlay = ({
  containerRef,
}: {
  containerRef: React.RefObject<HTMLDivElement | null>;
}) => {
  const store = useStudioStore();
  const hoveredPath = useReadStoreField(store, 'hoveredPath');
  const [positions, setPositions] = useState<FieldPosition[]>([]);

  useEffect(() => {
    if (!hoveredPath || !containerRef.current) {
      setPositions([]);
      return;
    }

    const ancestorPaths = getAncestorPaths(hoveredPath);
    const containerRect = containerRef.current.getBoundingClientRect();

    const fieldPositions: FieldPosition[] = [];

    for (const path of ancestorPaths) {
      const el = containerRef.current.querySelector(
        `[data-value-path="${path}"]`,
      );
      if (el) {
        const rect = el.getBoundingClientRect();
        const depth = parseInt(el.getAttribute('data-depth') || '0', 10);
        fieldPositions.push({
          path,
          top: rect.top - containerRect.top,
          height: rect.height,
          depth,
        });
      }
    }

    setPositions(fieldPositions);
  }, [hoveredPath, containerRef]);

  if (positions.length === 0) {
    return null;
  }

  const leafPos = positions[positions.length - 1];

  return (
    <div className="absolute inset-0 pointer-events-none">
      {positions.map((pos, i) => {
        const isLeaf = i === positions.length - 1;
        // Line extends from this ancestor down to the leaf
        const lineHeight = isLeaf
          ? pos.height
          : leafPos.top + leafPos.height - pos.top;

        return (
          <div
            key={pos.path}
            className="bg-blue-300 rounded-full"
            style={{
              position: 'absolute',
              top: pos.top,
              left: pos.depth * 12 + 4 - 12,
              width: 2,
              height: lineHeight,
              opacity: isLeaf ? 1 : 0.5,
            }}
          />
        );
      })}
    </div>
  );
};
