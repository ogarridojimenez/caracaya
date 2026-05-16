import { NextResponse, NextRequest } from 'next/server';
import { createServerSupabaseClient } from '@/lib/supabase/server';

export async function POST(request: NextRequest) {
  const supabase = createServerSupabaseClient();

  const { data: { user } } = await supabase.auth.getUser();
  if (!user) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
  }

  try {
    const body = await request.json();
    const { items } = body;

    if (!items || !Array.isArray(items) || items.length === 0) {
      return NextResponse.json({ error: 'Se requiere una lista de productos' }, { status: 400 });
    }

    const productIds = items.map((item: any) => item.productId);

    const { data: products, error } = await supabase
      .from('products')
      .select('id, name, stock_quantity, is_available, low_stock_threshold')
      .in('id', productIds);

    if (error) {
      return NextResponse.json({ error: error.message }, { status: 500 });
    }

    const stockInfo = items.map((item: any) => {
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
  const supabase = createServerSupabaseClient();

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
    return NextResponse.json({ error: error.message }, { status: 500 });
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