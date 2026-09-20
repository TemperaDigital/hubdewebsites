
import os
import pandas as pd
import streamlit as st
import google.generativeai as genai
from dotenv import load_dotenv
from datetime import datetime
from io import StringIO

# =========================================
# 🔐 Configuração da API Gemini
# =========================================
load_dotenv()
GOOGLE_API_KEY = os.getenv("GOOGLE_API_KEY")
if not GOOGLE_API_KEY:
    st.error("Chave da API do Google não encontrada. Defina GOOGLE_API_KEY no arquivo .env.")
    st.stop()

genai.configure(api_key=GOOGLE_API_KEY)
model = genai.GenerativeModel("gemini-pro")

# =========================================
# ⚙️ Configuração da página
# =========================================
st.set_page_config(page_title="Chatbot Servidores 1GptE", page_icon="🤖", layout="wide")

st.title("🤖 Chatbot dos Servidores - 1º Grupamento de Engenharia (1GptE)")

# =========================================
# 🗂️ Carregamento da planilha
# =========================================
@st.cache_data
def load_data(path_csv: str = "servidores.csv"):
    try:
        df = pd.read_csv(path_csv)
        return df
    except FileNotFoundError:
        return None

df = load_data()

if df is None:
    st.error("Arquivo 'servidores.csv' não encontrado na pasta do aplicativo. "
             "Coloque o arquivo na mesma pasta ou renomeie corretamente e recarregue.")
    st.stop()

# Armazena logs na sessão
if "logs" not in st.session_state:
    st.session_state["logs"] = []

# =========================================
# 🔀 Layout em abas
# =========================================
aba_chat, aba_dados, aba_logs = st.tabs(["💬 Chatbot", "📊 Dados", "📜 Logs"])

# -----------------------------------------
# 💬 ABA CHATBOT
# -----------------------------------------
with aba_chat:
    st.subheader("Faça perguntas sobre os servidores")

    # Perguntas rápidas
    perguntas_rapidas = {
        "Selecione…": "",
        "Quantos servidores temos no Grupamento?": "Quantos servidores temos no Grupamento?",
        "Quem trabalha na seção RH?": "Quem trabalha na seção RH?",
        "Liste os e-mails dos servidores de Engenharia": "Liste os e-mails dos servidores da seção Engenharia",
    }
    pergunta_sel = st.selectbox("Perguntas rápidas:", list(perguntas_rapidas.keys()))
    if pergunta_sel != "Selecione…":
        pergunta_default = perguntas_rapidas[pergunta_sel]
    else:
        pergunta_default = ""

    pergunta = st.text_input("Pergunta:", value=pergunta_default, key="pergunta_usuario")

    if st.button("Perguntar"):
        if not pergunta.strip():
            st.warning("Digite uma pergunta.")
        else:
            with st.spinner("Consultando a IA…"):
                # Constrói contexto limitado (para economizar tokens)
                MAX_LINHAS = 200  # ajuste se necessário
                contexto = "\n".join(
                    ", ".join([f"{col}: {row[col]}" for col in df.columns])
                    for _, row in df.head(MAX_LINHAS).iterrows()
                )

                prompt = f"""Você é um assistente do 1º Grupamento de Engenharia (1GptE).
Responda APENAS usando os dados da planilha de servidores a seguir.
Se a resposta não puder ser encontrada na planilha, responda: 'Não encontrei essa informação na planilha.'.

Planilha:
{contexto}

Pergunta: {pergunta}
"""

                try:
                    resposta = model.generate_content(prompt)
                    resposta_texto = resposta.text.strip()
                    st.success("Resposta:")
                    st.markdown(resposta_texto)

                    # Salva log
                    st.session_state["logs"].append({
                        "timestamp": datetime.now().isoformat(timespec="seconds"),
                        "pergunta": pergunta,
                        "resposta": resposta_texto
                    })

                except Exception as e:
                    st.error(f"Erro ao gerar resposta: {e}")

# -----------------------------------------
# 📊 ABA DADOS
# -----------------------------------------
with aba_dados:
    st.subheader("Visualização da planilha de servidores")
    st.write(f"Total de registros: **{len(df)}**")
    st.dataframe(df, use_container_width=True)

    # Download do CSV
    csv_buffer = StringIO()
    df.to_csv(csv_buffer, index=False)
    st.download_button("📥 Baixar CSV", csv_buffer.getvalue(), "servidores.csv", "text/csv")

# -----------------------------------------
# 📜 ABA LOGS
# -----------------------------------------
with aba_logs:
    st.subheader("Histórico de perguntas e respostas")
    if st.session_state["logs"]:
        df_logs = pd.DataFrame(st.session_state["logs"])
        st.dataframe(df_logs)
        csv_logs = StringIO()
        df_logs.to_csv(csv_logs, index=False)
        st.download_button("📥 Baixar logs CSV", csv_logs.getvalue(), "logs_interacao.csv", "text/csv")
    else:
        st.info("Nenhum log registrado ainda.")
