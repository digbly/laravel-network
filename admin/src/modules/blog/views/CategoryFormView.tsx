import { useState } from 'react';
import { ArrowLeft } from 'lucide-react';
import { useTranslation } from 'react-i18next';
import { useNavigate, useParams } from 'react-router-dom';
import { Button } from '../../../components/ui/Button';
import { Card, CardBody } from '../../../components/ui/Card';
import { ErrorAlert } from '../../../components/ui/ErrorAlert';
import { PageLoader } from '../../../components/ui/PageLoader';
import {
  useCreateCategoryMutation,
  useGetCategoriesQuery,
  useGetCategoryQuery,
  useUpdateCategoryMutation,
} from '../../../store/services/blogApi';
import { getErrorMessage } from '../../../utils/apiError';
import { websitePath } from '../../../utils/website';
import type { CategoryPayload } from '../../../types/blog';
import { CategoryForm } from '../components/CategoryForm';

export const CategoryFormView = () => {
  const { t } = useTranslation();
  const { websiteId, categoryId } = useParams<{ websiteId: string; categoryId: string }>();
  const navigate = useNavigate();

  const isEditing = Boolean(categoryId);
  const [error, setError] = useState<string | null>(null);

  const {
    data: categoryData,
    isLoading: isCategoryLoading,
    isError: isCategoryError,
    refetch: refetchCategory,
  } = useGetCategoryQuery(categoryId ?? '', { skip: !categoryId });
  const { data: categoriesData } = useGetCategoriesQuery({ per_page: 100 });
  const [createCategory, createState] = useCreateCategoryMutation();
  const [updateCategory, updateState] = useUpdateCategoryMutation();

  const category = categoryData?.data ?? null;
  const categories = categoriesData?.data ?? [];

  const goBack = () => navigate(websitePath('/blog/categories', websiteId));

  const handleSubmit = async (payload: CategoryPayload) => {
    setError(null);

    try {
      if (category) {
        await updateCategory({ id: category.id, body: payload }).unwrap();
      } else {
        await createCategory(payload).unwrap();
      }

      goBack();
    } catch (submitError) {
      setError(getErrorMessage(submitError, t('admin.blog.categories.errors.saveFailed')));
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
          {t('admin.blog.categories.form.back')}
        </Button>

        <div>
          <h2 className="text-xl sm:text-2xl font-bold tracking-tight text-slate-900 dark:text-white">
            {isEditing
              ? t('admin.blog.categories.form.editTitle')
              : t('admin.blog.categories.form.createTitle')}
          </h2>
          <p className="text-sm text-slate-500 dark:text-slate-400 mt-0.5">
            {t('admin.blog.categories.form.subtitle')}
          </p>
        </div>
      </div>

      {isEditing && isCategoryLoading && (
        <Card>
          <CardBody>
            <PageLoader />
          </CardBody>
        </Card>
      )}

      {isEditing && isCategoryError && (
        <Card>
          <CardBody className="space-y-4">
            <ErrorAlert message={t('admin.blog.categories.form.loadFailed')} />
            <Button variant="secondary" size="sm" onClick={() => void refetchCategory()}>
              {t('admin.blog.categories.errors.retry')}
            </Button>
          </CardBody>
        </Card>
      )}

      {(!isEditing || (!isCategoryLoading && !isCategoryError)) && (
        <Card>
          <CardBody>
            <CategoryForm
              key={category?.id ?? 'new'}
              category={category}
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
