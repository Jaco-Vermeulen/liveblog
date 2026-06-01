import { Link } from 'react-router-dom';
import { LbAlert } from '@/components/ui/LbAlert';
import { LbButton } from '@/components/ui/LbButton';
import { LbContentContainer } from '@/components/layout/LbContentContainer';
import { AF } from '@/copy';

export function AccessDeniedPage({ message }: { message?: string }) {
  return (
    <LbContentContainer size="md" centered className="py-16">
      <LbAlert variant="warning" className="mb-4">
        {message ?? AF.auth.accessDenied}
      </LbAlert>
      <Link to="/liveblog">
        <LbButton type="button" variant="primary">
          {AF.auth.backToBlogs}
        </LbButton>
      </Link>
    </LbContentContainer>
  );
}
