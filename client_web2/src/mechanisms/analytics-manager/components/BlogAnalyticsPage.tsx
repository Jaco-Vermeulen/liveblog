import { Link, useNavigate, useParams } from 'react-router-dom';
import { LbAlert } from '@/components/ui/LbAlert';
import { LbButton } from '@/components/ui/LbButton';
import { LbContentContainer } from '@/components/layout/LbContentContainer';
import { LbSpinner } from '@/components/ui/LbSpinner';
import { getBlog } from '@/mechanisms/liveblog-api';
import { useEffect, useState } from 'react';
import { useBlogAnalytics } from '../hooks/useBlogAnalytics';
import { downloadAnalyticsCsv } from '../utils/exportCsv';
import { AF } from '@/copy';
import { AnalyticsTable } from './AnalyticsTable';

export function BlogAnalyticsPage() {
  const { id: blogId } = useParams<{ id: string }>();
  const navigate = useNavigate();
  const { rows, loading, error } = useBlogAnalytics(blogId);
  const [blogTitle, setBlogTitle] = useState<string>('');

  useEffect(() => {
    if (!blogId) return;
    void getBlog(blogId).then((blog) => setBlogTitle(blog.title));
  }, [blogId]);

  if (!blogId) {
    return (
      <LbContentContainer>
        <LbAlert variant="error">{AF.analytics.missingId}</LbAlert>
      </LbContentContainer>
    );
  }

  return (
    <LbContentContainer size="full" className="py-6">
      <header className="mb-6 flex flex-wrap items-center justify-between gap-3">
        <div>
          <h1 className="m-0 text-xl font-semibold text-mar-text">{AF.analytics.title}</h1>
          {blogTitle && <p className="m-0 mt-1 text-sm text-mar-muted">{blogTitle}</p>}
        </div>
        <div className="flex flex-wrap gap-2">
          <LbButton type="button" variant="secondary" onClick={() => navigate(`/liveblog/edit/${blogId}`)}>
            {AF.analytics.done}
          </LbButton>
          <LbButton
            type="button"
            variant="primary"
            disabled={loading || rows.length === 0}
            onClick={() => downloadAnalyticsCsv(rows, blogId)}
          >
            {AF.analytics.exportCsv}
          </LbButton>
          <Link to={`/liveblog/edit/${blogId}`} className="sr-only">
            {AF.analytics.backToEditor}
          </Link>
        </div>
      </header>

      {error && (
        <LbAlert variant="error" className="mb-4">
          {error}
        </LbAlert>
      )}

      {loading ? (
        <div className="flex flex-col items-center py-16">
          <LbSpinner tone="dark" />
          <p className="mt-3 text-sm text-mar-muted">{AF.analytics.loading}</p>
        </div>
      ) : (
        <AnalyticsTable rows={rows} />
      )}
    </LbContentContainer>
  );
}
