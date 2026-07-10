import { ListSkeleton } from "@/components/ui/ListSkeleton";

export default function Loading() {
  return (
    <main className="pt-[120px] pb-20">
      <div className="mx-auto max-w-[1200px] px-4 sm:px-7 md:px-10">
        <div className="mb-8 h-8 w-32 animate-shimmer bg-gray-200" />
        <ListSkeleton count={12} columns={{ desktop: 4, tablet: 3, mobile: 2 }} showFilter />
      </div>
    </main>
  );
}
