import { NextResponse, NextRequest } from 'next/server';
import { withAuth } from '@/lib/auth/helpers';

interface StockCheckItem {
  productId: string;
  quantity: number;
}

export async function POST(request: NextRequest) {
  const auth = await withAuth(request);
  if ('error' in auth) return auth.error;

  const { supabase } = auth.success;

  try {
    const body = await request.json();
    const { items } = body as { items: StockCheckItem[] };

    if (!items || !Array.isArray(items) || items.length === 0) {
      return NextResponse.json({ error: 'Se requiere una lista de productos' }, { status: 400 });
    }

    const productIds = items.map((item: StockCheckItem) => item.productId);

    const { data: products, error } = await supabase
      .from('products')
      .select('id, name, stock_quantity, is_available, low_stock_threshold')
      .in('id', productIds);

    if (error) {
      console.error('[API/products/stock]', error.message);
      return NextResponse.json({ error: 'Error al verificar stock' }, { status: 500 });
    }

    const stockInfo = items.map((item: StockCheckItem) => {
      const product = products?.find(p => p.id === item.productId);
      
      if (!product) {
        return {
          productId: item.productId,
          available: false,
          reason: 'product_not_found'
        };
      }

      const hasStock = product.is_available && product.stock_quantity >= item.quantity;
      
      return {
        productId: item.productId,
        productName: product.name,
        available: hasStock,
        inStock: product.is_available && product.stock_quantity > 0,
        stockQuantity: product.stock_quantity,
        requestedQuantity: item.quantity,
        isLowStock: product.stock_quantity <= (product.low_stock_threshold || 5),
        reason: hasStock ? 'ok' : (!product.is_available ? 'unavailable' : 'insufficient_stock')
      };
    });

    const allAvailable = stockInfo.every(item => item.available);

    return NextResponse.json({
      available: allAvailable,
      items: stockInfo
    });

  } catch {
    return NextResponse.json({ error: 'Invalid request body' }, { status: 400 });
  }
}

export async function GET(request: NextRequest) {
  const auth = await withAuth(request);
  if ('error' in auth) return auth.error;

  const { supabase } = auth.success;

  const { searchParams } = new URL(request.url);
  const productId = searchParams.get('productId');

  if (!productId) {
    return NextResponse.json({ error: 'productId requerido' }, { status: 400 });
  }

  const { data: product, error } = await supabase
    .from('products')
    .select('id, name, stock_quantity, is_available, low_stock_threshold')
    .eq('id', productId)
    .single();

  if (error) {
    console.error('[API/products/stock GET]', error.message);
    return NextResponse.json({ error: 'Error al consultar stock' }, { status: 500 });
  }

  return NextResponse.json({
    productId: product.id,
    productName: product.name,
    inStock: product.is_available && product.stock_quantity > 0,
    stockQuantity: product.stock_quantity,
    isAvailable: product.is_available,
    isLowStock: product.stock_quantity <= (product.low_stock_threshold || 5)
  });
}