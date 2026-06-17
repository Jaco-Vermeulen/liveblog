import { useQuery } from '@tanstack/react-query';
import {
  listAllMediaPictures,
  listBlogImageItems,
  type ArchivePicture,
  type BlogImageItem,
} from '@/mechanisms/liveblog-api';

export const featuredImageLibraryQueryKey = (blogId: string) =>
  ['featured-image-library', blogId] as const;

export function useFeaturedImageLibrary(blogId: string, enabled: boolean) {
  return useQuery({
    queryKey: featuredImageLibraryQueryKey(blogId),
    enabled: enabled && Boolean(blogId),
    queryFn: async (): Promise<{ pictures: ArchivePicture[]; items: BlogImageItem[] }> => {
      const [pictures, items] = await Promise.all([
        listAllMediaPictures(),
        listBlogImageItems(blogId),
      ]);
      return {
        pictures,
        items: items._items ?? [],
      };
    },
    staleTime: 30_000,
  });
}
