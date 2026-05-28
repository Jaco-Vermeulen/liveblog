import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query';
import {
  createOutput,
  deleteOutput,
  listBlogOutputs,
  listConsumers,
  listUsers,
  updateBlog,
  updateOutput,
  type Blog,
  type Consumer,
  type Output,
} from '@/mechanisms/liveblog-api';

export type SettingsTab = 'general' | 'team' | 'outputs' | 'consumers';

export function useBlogSettings(blog: Blog | undefined) {
  const blogId = blog?._id;
  const queryClient = useQueryClient();

  const outputsQuery = useQuery({
    queryKey: ['blog-outputs', blogId],
    queryFn: () => listBlogOutputs(blogId!),
    enabled: Boolean(blogId),
  });

  const consumersQuery = useQuery({
    queryKey: ['consumers'],
    queryFn: listConsumers,
  });

  const usersQuery = useQuery({
    queryKey: ['users'],
    queryFn: () => listUsers(),
  });

  const updateBlogMutation = useMutation({
    mutationFn: async (patch: Partial<Blog>) => {
      if (!blog) throw new Error('Blog required');
      return updateBlog(blog, patch);
    },
    onSuccess: (updated) => {
      queryClient.setQueryData(['blog', blogId], updated);
    },
  });

  const saveOutputMutation = useMutation({
    mutationFn: async (payload: { output?: Output; data: Partial<Output> }) => {
      const { output, data } = payload;
      if (output?._id && output._etag) {
        return updateOutput(output, data);
      }
      return createOutput({
        name: data.name ?? 'Output',
        blog: blogId!,
        collection: data.collection ?? '',
        theme: data.theme ?? null,
        tags: data.tags ?? [],
        settings: data.settings ?? { frequency: 10, order: -1 },
        style: data.style ?? {},
      });
    },
    onSuccess: () => {
      void queryClient.invalidateQueries({ queryKey: ['blog-outputs', blogId] });
      void queryClient.invalidateQueries({ queryKey: ['blog', blogId] });
    },
  });

  const removeOutputMutation = useMutation({
    mutationFn: (output: Output) => deleteOutput(output),
    onSuccess: () => {
      void queryClient.invalidateQueries({ queryKey: ['blog-outputs', blogId] });
    },
  });

  const updateConsumersSettings = useMutation({
    mutationFn: async (consumers_settings: Blog['consumers_settings']) => {
      if (!blog) throw new Error('Blog required');
      return updateBlog(blog, { consumers_settings });
    },
    onSuccess: (updated) => {
      queryClient.setQueryData(['blog', blogId], updated);
    },
  });

  const memberUsers =
    usersQuery.data?._items.filter((user) =>
      blog?.members?.some((m) => m.user === user._id),
    ) ?? [];

  return {
    outputs: outputsQuery.data?._items ?? [],
    outputsLoading: outputsQuery.isLoading,
    consumers: consumersQuery.data?._items ?? [],
    consumersLoading: consumersQuery.isLoading,
    allUsers: usersQuery.data?._items ?? [],
    memberUsers,
    updateBlog: updateBlogMutation.mutateAsync,
    isUpdatingBlog: updateBlogMutation.isPending,
    saveOutput: saveOutputMutation.mutateAsync,
    removeOutput: removeOutputMutation.mutateAsync,
    updateConsumersSettings: updateConsumersSettings.mutateAsync,
    isSavingConsumers: updateConsumersSettings.isPending,
  };
}

export function getConsumerTags(
  blog: Blog | undefined,
  consumer: Consumer,
): string[] {
  const settings = blog?.consumers_settings ?? {};
  return settings[consumer._id]?.tags ?? [];
}
