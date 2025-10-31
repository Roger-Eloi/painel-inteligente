import { ParsedWidget } from "./jsonParser";

export interface DuplicateCheckResult {
  isDuplicate: boolean;
  duplicateOf?: string;
  reason?: 'documentId' | 'slug' | 'contentHash';
}

export const generateWidgetHash = (widget: ParsedWidget): string => {
  const hashContent = {
    slug: widget.slug,
    kind: widget.kind,
    name: widget.name,
    dataLength: widget.data?.length || 0,
    firstDataPoint: widget.data?.[0] || null,
  };
  return btoa(JSON.stringify(hashContent));
};

export const checkDuplicate = (
  newWidget: ParsedWidget,
  existingWidgets: ParsedWidget[]
): DuplicateCheckResult => {
  // Check by documentId
  if (newWidget.documentId) {
    const duplicateById = existingWidgets.find(
      (w) => w.documentId === newWidget.documentId
    );
    if (duplicateById) {
      return {
        isDuplicate: true,
        duplicateOf: duplicateById.name,
        reason: 'documentId',
      };
    }
  }

  // Check by slug
  if (newWidget.slug) {
    const duplicateBySlug = existingWidgets.find(
      (w) => w.slug === newWidget.slug && w.name === newWidget.name
    );
    if (duplicateBySlug) {
      return {
        isDuplicate: true,
        duplicateOf: duplicateBySlug.name,
        reason: 'slug',
      };
    }
  }

  // Check by content hash
  const newHash = generateWidgetHash(newWidget);
  const duplicateByHash = existingWidgets.find(
    (w) => generateWidgetHash(w) === newHash
  );
  if (duplicateByHash) {
    return {
      isDuplicate: true,
      duplicateOf: duplicateByHash.name,
      reason: 'contentHash',
    };
  }

  return { isDuplicate: false };
};

export interface FilterDuplicatesResult {
  unique: ParsedWidget[];
  duplicates: Array<{ widget: ParsedWidget; duplicateOf: string; reason: string }>;
}

export const filterDuplicates = (
  newWidgets: ParsedWidget[],
  existingWidgets: ParsedWidget[]
): FilterDuplicatesResult => {
  const unique: ParsedWidget[] = [];
  const duplicates: Array<{ widget: ParsedWidget; duplicateOf: string; reason: string }> = [];
  const allExisting = [...existingWidgets];

  for (const widget of newWidgets) {
    const check = checkDuplicate(widget, allExisting);
    if (check.isDuplicate) {
      duplicates.push({
        widget,
        duplicateOf: check.duplicateOf || 'unknown',
        reason: check.reason || 'unknown',
      });
    } else {
      unique.push(widget);
      allExisting.push(widget); // Add to check subsequent duplicates within the same batch
    }
  }

  return { unique, duplicates };
};
