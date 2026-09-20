import os
import pandas as pd
import streamlit as st
from google import genai
from dotenv import load_dotenv
from datetime import datetime
from io import StringIO

# =========================================
# 🎨 Configuração da página
# =========================================
st.set_page_config(
    page_title="Chatbot Servidores 1GptE",
    page_icon="🤖",
    layout="centered"
)

# =========================================
# 🔐 Inicialização da API Gemini (Nova SDK)
# =========================================
load_dotenv()
GOOGLE_API_KEY = os.getenv("GOOGLE_API_KEY")

if not GOOGLE_API_KEY:
    st.error("Erro: A chave 'GOOGLE_API_KEY' não foi encontrada no arquivo .env.")
    st.stop()

client = genai.Client(api_key=GOOGLE_API_KEY)

st.title("🤖 Chatbot dos Servidores — 1º Grupamento de Engenharia")

# =========================================
# 📥 Carregamento da planilha
# =========================================
@st.cache_data
def load_data(path="servidores.csv"):
    try:
        return pd.read_csv(path)
    except FileNotFoundError:
        st.error("Arquivo 'servidores.csv' não encontrado no diretório.")
        return None

df = load_data()

if df is None:
    st.stop()

def construir_contexto(dataframe: pd.DataFrame) -> str:
    linhas = []
    for _, row in dataframe.iterrows():
        linha = ", ".join([f"{col}: {row[col]}" for col in dataframe.columns])
        linhas.append(linha)
    return "\n".join(linhas)

# =========================================
# 🗄️ Barra Lateral
# =========================================
with st.sidebar:
    st.header("ℹ️ Ajuda rápida")
    st.markdown("""
    - **Pergunte** sobre nomes, seções, e-mails, endereços…
    - Use o **seletor de perguntas rápidas** para exemplos.
    - Todos os dados são respondidos a partir da planilha local.
    """)

    st.subheader("🔄 Baixar logs")
    if "logs" in st.session_state and st.session_state["logs"]:
        csv_buffer = StringIO()
        pd.DataFrame(st.session_state["logs"]).to_csv(csv_buffer, index=False)
        st.download_button("Download CSV", csv_buffer.getvalue(), "logs_interacao.csv", "text/csv")
    else:
        st.write("Nenhum log disponível.")

# =========================================
# 📑 Navegação por Abas
# =========================================
tab_chat, tab_dados, tab_logs = st.tabs(["💬 Chatbot", "📄 Dados", "📜 Logs"])

with tab_dados:
    st.subheader("Planilha completa")
    st.dataframe(df, use_container_width=True)

with tab_logs:
    st.subheader("Histórico de interações")
    logs_df = pd.DataFrame(st.session_state.get("logs", []))
    if logs_df.empty:
        st.info("Nenhuma interação registrada ainda.")
    else:
        st.dataframe(logs_df, use_container_width=True)

with tab_chat:
    contexto = construir_contexto(df)

    perguntas_rapidas = {
        "Total de servidores": "Quantos servidores tem atualmente no Grupamento?",
        "Servidores da seção RH": "Quais servidores estão na seção RH?",
        "E-mails de todos": "Quais são os e-mails de todos os servidores?",
        "Endereços completos": "Mostre os endereços de todos os servidores.",
    }

    col1, col2 = st.columns([2, 1])
    with col1:
        pergunta_usuario = st.text_input("Digite sua pergunta:")
    with col2:
        escolha = st.selectbox("Perguntas rápidas", ["—"] + list(perguntas_rapidas.keys()))
        if escolha != "—":
            pergunta_usuario = perguntas_rapidas[escolha]

    if "logs" not in st.session_state:
        st.session_state["logs"] = []

    if pergunta_usuario:
        with st.spinner("Consultando a IA…"):
            prompt = f"""
Você é um assistente do 1º Grupamento de Engenharia (1GptE).
Responda com base **apenas** nas informações abaixo, extraídas da planilha de servidores:

{contexto}

Pergunta: {pergunta_usuario}
"""
            try:
                resposta = client.models.generate_content(
                    model="gemini-2.5-flash",
                    contents=prompt
                )
                st.success("Resposta gerada!")
                st.markdown(resposta.text)
                
                st.session_state["logs"].append({
                    "timestamp": datetime.now().strftime("%Y-%m-%d %H:%M:%S"),
                    "pergunta": pergunta_usuario,
                    "resposta": resposta.text
                })
            except Exception as e:
                st.error(f"Erro ao gerar resposta: {e}")