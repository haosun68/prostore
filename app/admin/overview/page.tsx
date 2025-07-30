import { auth } from '@/auth';
import { Metadata } from 'next';
import { getOrderSummary } from '@/lib/actions/order.actions';
import { Card, CardHeader, CardTitle, CardContent } from '@/components/ui/card';
import { Table, TableHeader, TableRow, TableHead, TableBody, TableCell } from '@/components/ui/table';
import { BadgeDollarSign, CreditCard, Users, Barcode } from 'lucide-react';
import Link from 'next/link';
import { formatCurrency, formatNumber, formatDateTime } from '@/lib/utils';
import Charts from './charts';
import { requireAdmin } from '@/lib/auth-guard';

export const metadata: Metadata = {
  title: 'Admin Dashboard',
};

const AdminOverviewPage = async () => {
  await requireAdmin();

  const summary = await getOrderSummary();


  return <div className='space-y-2'>
    <h1 className="h2-bold">Dashboard</h1>
    <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
      <Card>
        <CardHeader className='flex flex-row items-center justify-between space-y-0 pb-2'>
          <CardTitle className='text-sm font-medium'>Total Revenue</CardTitle>
          <BadgeDollarSign />
        </CardHeader>
        <CardContent>
          <div className="text-2xl font-bold">
            {formatCurrency(summary.totalSales._sum.totalPrice!.toString())}
          </div>
        </CardContent>
      </Card>
      <Card>
        <CardHeader className='flex flex-row items-center justify-between space-y-0 pb-2'>
          <CardTitle className='text-sm font-medium'>Sales</CardTitle>
          <CreditCard />
        </CardHeader>
        <CardContent>
          <div className="text-2xl font-bold">
            {formatNumber(summary.ordersCount)}
          </div>
        </CardContent>
      </Card>
      <Card>
        <CardHeader className='flex flex-row items-center justify-between space-y-0 pb-2'>
          <CardTitle className='text-sm font-medium'>Customers</CardTitle>
          <Users />
        </CardHeader>
        <CardContent>
          <div className="text-2xl font-bold">
            {formatNumber(summary.usersCount)}
          </div>
        </CardContent>
      </Card>
      <Card>
        <CardHeader className='flex flex-row items-center justify-between space-y-0 pb-2'>
          <CardTitle className='text-sm font-medium'>Products</CardTitle>
          <Barcode />
        </CardHeader>
        <CardContent>
          <div className="text-2xl font-bold">
            {formatNumber(summary.productsCount)}
          </div>
        </CardContent>
      </Card>
    </div>
    <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-7">
      <Card className='col-span-4'>
        <CardHeader>
          <CardTitle>Overview</CardTitle>
        </CardHeader>
        <CardContent>
          <Charts data={{ salesData: summary.salesData, }} />
        </CardContent>
      </Card>
      <Card className='col-span-3'>
        <CardHeader>
          <CardTitle>Recent Sales</CardTitle>
        </CardHeader>
        <CardContent>
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>BUYER</TableHead>
                <TableHead>DATE</TableHead>
                <TableHead>TOTAL</TableHead>
                <TableHead>ACTIONS</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {summary.latestSales.map((sale) => (
                <TableRow key={sale.id}>
                  <TableCell>{sale.user.name}</TableCell>
                  <TableCell>{formatDateTime(sale.createdAt).dateOnly}</TableCell>
                  <TableCell>{formatCurrency(sale.totalPrice)}</TableCell>
                  <TableCell>
                    <Link href={`/order/${sale.id}`}>
                      <span className="px-2">Details</span>
                    </Link>
                  </TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>
        </CardContent>
      </Card>
    </div>
  </div>;
};

export default AdminOverviewPage; 