export const cn = (...values: Array<string | false | null | undefined>) => values.filter(Boolean).join(' ');

export const groupBy = <TItem, TKey extends string>(
  items: TItem[],
  resolver: (item: TItem) => TKey
) =>
  items.reduce<Record<TKey, TItem[]>>((accumulator, item) => {
    const key = resolver(item);
    accumulator[key] ??= [];
    accumulator[key].push(item);
    return accumulator;
  }, {} as Record<TKey, TItem[]>);

export const uniqueBy = <TItem, TKey extends string | number>(
  items: TItem[],
  resolver: (item: TItem) => TKey
) => {
  const seen = new Set<TKey>();
  return items.filter((item) => {
    const key = resolver(item);
    if (seen.has(key)) {
      return false;
    }

    seen.add(key);
    return true;
  });
};

export const sleep = (duration: number) =>
  new Promise((resolve) => {
    window.setTimeout(resolve, duration);
  });
