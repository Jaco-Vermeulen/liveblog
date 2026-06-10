import { useEffect, useState, type FormEvent } from 'react';
import { ArrowLeft } from 'lucide-react';
import { Link, useNavigate, useParams } from 'react-router-dom';
import { useAuth } from '@/mechanisms/auth-manager';
import { LbAlert } from '@/components/ui/LbAlert';
import { LbLoadingScreen } from '@/components/ui/LbLoadingScreen';
import { LiveblogApiError, type Output } from '@/mechanisms/liveblog-api';
import { useBlog } from '../hooks/useBlog';
import { useBlogSettings, type SettingsTab } from '../hooks/useBlogSettings';
import {
  buildBlogPatchFromForm,
  useBlogGeneralSettings,
} from '../hooks/useBlogGeneralSettings';
import {
  ConsumersList,
  GeneralSettings,
  MembersSettings,
  OutputsTab,
  SettingsRail,
} from '../subsystems/blog-settings-rail';
import { OutputEmbedCodeModal, OutputModal } from '../subsystems/output-modal';
import { EditorChromeActions } from '../components/EditorChromeActions';
import { AF } from '@/copy';
import { canAccessBlogSettings } from '../services/blogSecurity';

export function SettingsPage() {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();
  const { state: authState } = useAuth();
  const { blog, isLoading, error, updateBlog, isUpdating } = useBlog(id);
  const settings = useBlogSettings(blog);
  const general = useBlogGeneralSettings(blog);

  const [tab, setTab] = useState<SettingsTab>('general');
  const [message, setMessage] = useState<string | null>(null);
  const [outputModalOpen, setOutputModalOpen] = useState(false);
  const [editingOutput, setEditingOutput] = useState<Output | null>(null);
  const [embedOutput, setEmbedOutput] = useState<Output | null>(null);

  useEffect(() => {
    if (error instanceof LiveblogApiError && error.status === 404) {
      navigate('/liveblog', { replace: true });
    }
  }, [error, navigate]);

  useEffect(() => {
    if (blog && authState.user && !canAccessBlogSettings(blog, authState.user)) {
      navigate(`/liveblog/edit/${blog._id}`, { replace: true });
    }
  }, [authState.user, blog, navigate]);

  const handleSaveGeneral = async (e: FormEvent) => {
    e.preventDefault();
    if (!blog || !general.form) return;
    setMessage(null);
    try {
      await updateBlog(buildBlogPatchFromForm(blog, general.form));
      setMessage(AF.editor.settings.saved);
    } catch {
      setMessage(AF.editor.settings.errors.save);
    }
  };

  const openOutputDialog = (output: Output | null = null) => {
    setEditingOutput(output);
    setOutputModalOpen(true);
  };

  const handleRemoveOutput = async (output: Output) => {
    if (!window.confirm(AF.editor.settings.confirmDeleteOutput)) return;
    try {
      await settings.removeOutput(output);
      setMessage(AF.editor.settings.outputRemoved);
    } catch {
      setMessage(AF.editor.settings.errors.deleteOutput);
    }
  };

  if (isLoading || !blog || !general.form) {
    return <LbLoadingScreen message={AF.editor.settings.loadingBlog} />;
  }

  return (
    <div className="lb-route-fill overflow-auto">
      <div className="m-editor-settings m-portal-settings">
      <header className="m-editor-chrome">
        <div className="m-editor-chrome__start">
          <Link
            to={`/liveblog/edit/${blog._id}`}
            className="m-editor-chrome__icon-btn m-editor-chrome__home"
            title={AF.editor.settings.backToEditor}
            aria-label={AF.editor.settings.backToEditor}
          >
            <ArrowLeft className="h-5 w-5" aria-hidden />
          </Link>
          <div>
            <h1 className="m-editor-chrome__title">{AF.routes.blogSettings}</h1>
            <p className="m-editor-chrome__subtitle">{blog.title}</p>
          </div>
        </div>
        <EditorChromeActions blog={blog} user={authState.user} mode="settings" />
      </header>

      {message && (
        <LbAlert
          variant={message.includes('nie') ? 'error' : 'info'}
          className="mx-6 mb-4 max-w-4xl"
        >
          {message}
        </LbAlert>
      )}

      <SettingsRail tab={tab} onTabChange={setTab}>
        {tab === 'general' && (
          <GeneralSettings
            form={general.form}
            themes={general.themes}
            languages={general.languages}
            blogCategories={general.blogCategories}
            publicUrl={general.publicUrl}
            embedCode={general.embedCode}
            metaLoading={general.metaLoading}
            blogId={blog._id}
            isSaving={isUpdating}
            onChange={general.updateForm}
            onUploadImage={(file) => void general.uploadPicture(file)}
            onRemoveImage={general.clearPicture}
            onSubmit={(e) => void handleSaveGeneral(e)}
          />
        )}
        {tab === 'team' && (
          <MembersSettings
            blog={blog}
            memberUsers={settings.memberUsers}
            allUsers={settings.allUsers}
            isSaving={settings.isUpdatingBlog}
            onSaveMembers={async (members) => {
              await settings.updateBlog({ members });
              setMessage('Span gestoor.');
            }}
          />
        )}
        {tab === 'outputs' && (
          <OutputsTab
            outputs={settings.outputs}
            loading={settings.outputsLoading}
            onAdd={() => openOutputDialog(null)}
            onEdit={openOutputDialog}
            onRemove={(output) => void handleRemoveOutput(output)}
            onShowEmbed={setEmbedOutput}
          />
        )}
        {tab === 'consumers' && (
          <ConsumersList
            blog={blog}
            consumers={settings.consumers}
            loading={settings.consumersLoading}
            isSaving={settings.isSavingConsumers}
            onSaveConsumerSettings={async (consumers_settings) => {
              await settings.updateConsumersSettings(consumers_settings);
              setMessage('Verbruiker-instellings gestoor.');
            }}
          />
        )}
      </SettingsRail>

      <OutputModal
        open={outputModalOpen}
        blog={blog}
        output={editingOutput}
        onClose={() => {
          setOutputModalOpen(false);
          setEditingOutput(null);
        }}
        onSave={async (data, existing) => {
          await settings.saveOutput({ output: existing ?? undefined, data });
          setMessage('Uitset gestoor.');
        }}
      />

      <OutputEmbedCodeModal
        open={Boolean(embedOutput)}
        blog={blog}
        output={embedOutput}
        onClose={() => setEmbedOutput(null)}
      />
      </div>
    </div>
  );
}
