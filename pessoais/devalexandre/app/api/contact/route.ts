export const dynamic = 'force-dynamic';
import { NextResponse } from 'next/server';

export async function POST(request: Request) {
  try {
    const data = await request.json();
    const { name, email, message } = data;

    if (!name?.trim() || !email?.trim() || !message?.trim()) {
      return NextResponse.json(
        { success: false, message: 'Todos os campos são obrigatórios.' },
        { status: 400 }
      );
    }

    const formspreeId = process.env.NEXT_PUBLIC_FORMSPREE_ID;
    if (!formspreeId) {
      return NextResponse.json(
        { success: false, message: 'Formulário não configurado.' },
        { status: 500 }
      );
    }

    const response = await fetch(`https://formspree.io/f/${formspreeId}`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ name, email, message }),
    });

    if (!response.ok) {
      throw new Error('Erro ao enviar pelo Formspree');
    }

    return NextResponse.json({ success: true, message: 'Mensagem enviada com sucesso!' });
  } catch (error) {
    console.error('Erro no contato:', error);
    return NextResponse.json(
      { success: false, message: 'Erro interno. Tente novamente mais tarde.' },
      { status: 500 }
    );
  }
}