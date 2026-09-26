import { useState } from 'react';
import { ArrowLeft } from 'lucide-react';
import { useTranslation } from 'react-i18next';
import { useNavigate, useParams } from 'react-router-dom';
import { Button } from '../../../components/ui/Button';
import { Card, CardBody } from '../../../components/ui/Card';
import { ErrorAlert } from '../../../components/ui/ErrorAlert';
import { PageLoader } from '../../../components/ui/PageLoader';
import {
  useCreatePostMutation,
  useGetCategoriesQuery,
  useGetPostQuery,
  useUpdatePostMutation,
} from '../../../store/services/blogApi';
import { getErrorMessage } from '../../../utils/apiError';
import { websitePath } from '../../../utils/website';
import type { PostPayload } from '../../../types/blog';
import { PostForm } from '../components/PostForm';

export const PostFormView = () => {
  const { t } = useTranslation();
  const { websiteId, postId } = useParams<{ websiteId: string; postId: string }>();
  const navigate = useNavigate();

  const isEditing = Boolean(postId);
  const [error, setError] = useState<string | null>(null);

  const {
    data: postData,
    isLoading: isPostLoading,
    isError: isPostError,
    refetch: refetchPost,
  } = useGetPostQuery(postId ?? '', { skip: !postId });
  const { data: categoriesData } = useGetCategoriesQuery({ per_page: 100 });
  const [createPost, createState] = useCreatePostMutation();
  const [updatePost, updateState] = useUpdatePostMutation();

  const post = postData?.data ?? null;
  const categories = categoriesData?.data ?? [];

  const goBack = () => navigate(websitePath('/blog/posts', websiteId));

  const handleSubmit = async (payload: PostPayload) => {
    setError(null);

    try {
      if (post) {
        await updatePost({ id: post.id, body: payload }).unwrap();
      } else {
        await createPost(payload).unwrap();
      }

      goBack();
    } catch (submitError) {
      setError(getErrorMessage(submitError, t('admin.blog.posts.errors.saveFailed')));
    }
  };

  return (
    <div className="space-y-6 animate-in fade-in duration-200">
      <div className="flex flex-col gap-3">
        <Button
          type="button"
          variant="ghost"
          size="sm"
          className="w-fit -ml-2"
          leftIcon={<ArrowLeft className="w-4 h-4" />}
          onClick={goBack}
        >
          {t('admin.blog.posts.form.back')}
        </Button>

        <div>
          <h2 className="text-xl sm:text-2xl font-bold tracking-tight text-slate-900 dark:text-white">
            {isEditing ? t('admin.blog.posts.form.editTitle') : t('admin.blog.posts.form.createTitle')}
          </h2>
          <p className="text-sm text-slate-500 dark:text-slate-400 mt-0.5">
            {t('admin.blog.posts.form.subtitle')}
          </p>
        </div>
      </div>

      {isEditing && isPostLoading && (
        <Card>
          <CardBody>
            <PageLoader />
          </CardBody>
        </Card>
      )}

      {isEditing && isPostError && (
        <Card>
          <CardBody className="space-y-4">
            <ErrorAlert message={t('admin.blog.posts.form.loadFailed')} />
            <Button variant="secondary" size="sm" onClick={() => void refetchPost()}>
              {t('admin.blog.posts.errors.retry')}
            </Button>
          </CardBody>
        </Card>
      )}

      {(!isEditing || (!isPostLoading && !isPostError)) && (
        <Card>
          <CardBody>
            <PostForm
              key={post?.id ?? 'new'}
              post={post}
              categories={categories}
              isSubmitting={createState.isLoading || updateState.isLoading}
              error={error}
              onSubmit={(payload) => void handleSubmit(payload)}
              onCancel={goBack}
            />
          </CardBody>
        </Card>
      )}
    </div>
  );
};
