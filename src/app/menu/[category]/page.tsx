import { redirect } from 'next/navigation';

export default function CategoryMenuRedirectPage({ params }: { params: { category: string } }) {
  redirect(`/menu?category=${params.category}`);
}
