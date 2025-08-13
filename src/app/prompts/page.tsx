'use client';

import { ProtectedRoute } from '@/components/auth/ProtectedRoute';
import { PromptFlow } from '@/components/prompts/PromptFlow';
import { useOrganization } from '@/contexts/OrganizationContext';
import { useRouter } from 'next/navigation';
import { useEffect } from 'react';

export default function PromptsPage() {
  const { currentOrganization } = useOrganization();
  const router = useRouter();

  useEffect(() => {
    // Redirect to organization selection if not selected
    if (!currentOrganization) {
      router.push('/browse');
    }
  }, [currentOrganization, router]);

  return (
    <ProtectedRoute>
      <PromptFlow />
    </ProtectedRoute>
  );
}