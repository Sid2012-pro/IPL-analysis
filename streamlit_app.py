import streamlit as st

st.set_page_config(page_title="Cricket Markov Predictor", layout="centered")

st.markdown("""
<style>
  .stApp { background-color: #0a1628; color: #e8eaf0; }
  .block-container { padding-top: 2rem; }
  .insight-box { background: #131f35; border-left: 3px solid #378ADD;
                 padding: 12px 16px; border-radius: 4px; color: #9aaac0;
                 font-size: 14px; margin-top: 1rem; }
</style>
""", unsafe_allow_html=True)

T = {
    'Dot':      {'Dot': 33.8, 'Single': 41.6, 'Boundary': 22.1, 'Wicket': 2.6},
    'Single':   {'Dot': 27.4, 'Single': 48.7, 'Boundary': 15.0, 'Wicket': 8.9},
    'Boundary': {'Dot': 39.4, 'Single': 47.8, 'Boundary': 7.9,  'Wicket': 5.3},
    'Wicket':   {'Dot': 33.3, 'Single': 60.0, 'Boundary': 6.7,  'Wicket': 0.0},
}

COLORS = {'Dot':'#888780', 'Single':'#378ADD', 'Boundary':'#1D9E75', 'Wicket':'#D85A30'}

INSIGHTS = {
    'Dot':      "After a dot ball, the batter most often tries to rotate strike — a single is most likely at 41.6%.",
    'Single':   "Singles are the stickiest state — nearly half the time (48.7%), another single follows. Wickets are also highest here at 8.9%.",
    'Boundary': "After a boundary, batters consolidate — dot balls spike to 39.4% and consecutive boundaries drop to just 7.9%.",
    'Wicket':   "New batters play cautious cricket. A single is overwhelmingly likely (60%) while boundaries drop to 6.7%.",
}

st.markdown("<h1 style='text-align:center;color:white;font-weight:500'>Cricket Markov Chain Predictor</h1>", unsafe_allow_html=True)
st.markdown("<p style='text-align:center;color:#7a8aaa;font-size:14px'>CSK vs SRH · IPL 2025</p>", unsafe_allow_html=True)

state = st.selectbox("Current ball outcome:", list(T.keys()))
probs = T[state]
most_likely = max(probs, key=probs.get)

st.markdown("#### Next ball probabilities")
for s, p in probs.items():
    col1, col2 = st.columns([1, 4])
    col1.markdown(f'<span style="color:{COLORS[s]};font-weight:500">{s}</span>', unsafe_allow_html=True)
    col2.progress(int(p), text=f"{p:.1f}%")

st.markdown(f"""
<div style="display:flex;justify-content:space-between;background:#131f35;
            border-radius:10px;padding:1rem 1.25rem;margin-top:1rem;">
  <div>
    <div style="font-size:12px;color:#7a8aaa">Most likely next ball</div>
    <div style="font-size:20px;font-weight:500;color:{COLORS[most_likely]}">{most_likely}</div>
  </div>
  <div style="text-align:right">
    <div style="font-size:12px;color:#7a8aaa">Probability</div>
    <div style="font-size:16px;color:#9aaac0">{probs[most_likely]:.1f}%</div>
  </div>
</div>
""", unsafe_allow_html=True)

st.markdown(f'<div class="insight-box">{INSIGHTS[state]}</div>', unsafe_allow_html=True)