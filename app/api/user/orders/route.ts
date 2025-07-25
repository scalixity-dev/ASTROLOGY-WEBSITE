// File: app/api/user/orders/route.ts
export const dynamic = "force-dynamic";

import { NextRequest, NextResponse } from 'next/server';
import { getServerSession } from 'next-auth/next';
import { authOptions } from '@/lib/auth';
import pool from '@/lib/db';

// Define proper types for database results
type UserResult = { id: number }[];
type Order = {
  id: number;
  total_amount: number;
  status: string;
  created_at: string;
};
type Orders = Order[];
type OrderItem = {
  id: number;
  order_id: number;
  product_id: number;
  quantity: number;
  carats: number | null;
  price: number;
  is_stone: number;
  is_service: number;
  product_name: string;
};
type OrderItems = OrderItem[];

export async function GET(req: NextRequest) {
  try {
    const session = await getServerSession(authOptions);
    
    if (!session || !session.user) {
      return NextResponse.json(
        { error: 'You must be logged in to view your orders' },
        { status: 401 }
      );
    }

    // Get Google ID from session
    const userGoogleId = session.user.id;
    const connection = await pool.getConnection();
    
    try {
      // First get the internal user ID by Google ID
      const [userResult] = await connection.query(
        'SELECT id FROM users WHERE google_id = ?',
        [userGoogleId]
      );
      
      if ((userResult as UserResult).length === 0) {
        return NextResponse.json({ error: 'User not found' }, { status: 404 });
      }
      
      const userId = (userResult as UserResult)[0].id;
      
      // Get all orders for this user
      const [orders] = await connection.query(
        `SELECT id, total_amount, status, created_at
         FROM orders
         WHERE user_id = ?
         ORDER BY created_at DESC`,
        [userId]
      );
      
      // For each order, get its items
      const ordersWithItems = await Promise.all((orders as Orders).map(async (order) => {
        const [items] = await connection.query(
          `SELECT oi.*, 
            CASE 
              WHEN oi.is_stone = 1 THEN s.name
              WHEN oi.is_service = 1 THEN srv.title_en
              ELSE p.name
            END as product_name
           FROM order_items oi
           LEFT JOIN products p ON oi.product_id = p.id AND oi.is_stone = 0 AND oi.is_service = 0
           LEFT JOIN stones s ON oi.product_id = s.id AND oi.is_stone = 1 AND oi.is_service = 0
           LEFT JOIN services srv ON oi.product_id = srv.id AND oi.is_service = 1
           WHERE oi.order_id = ?`,
          [order.id]
        );
        
        return {
          ...order,
          items: items as OrderItems,
        };
      }));
      
      return NextResponse.json({ orders: ordersWithItems });
    } finally {
      connection.release();
    }
  } catch (error) {
    console.error('Error fetching orders:', error);
    return NextResponse.json(
      { error: 'Failed to fetch orders' },
      { status: 500 }
    );
  }
}