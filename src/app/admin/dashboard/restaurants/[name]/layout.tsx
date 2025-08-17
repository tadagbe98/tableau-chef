
import { RestaurantDetailBreadcrumb } from './Breadcrumb';

export default function RestaurantDetailLayout({
  children,
  params,
}: {
  children: React.ReactNode;
  params: { name: string };
}) {
  return (
    <div className="space-y-4">
      <RestaurantDetailBreadcrumb name={params.name} />
      <div>{children}</div>
    </div>
  );
}
