"""
Diagrama de Classes — Painel WK Presentes (Flow)
Gera um PNG com o diagrama UML completo do sistema.
"""
import matplotlib
matplotlib.use('Agg')
import matplotlib.pyplot as plt
import matplotlib.patches as mpatches
from matplotlib.patches import FancyBboxPatch
import matplotlib.patheffects as pe

# ── Canvas ────────────────────────────────────────────────────────────────────
FW, FH = 34, 24
fig, ax = plt.subplots(figsize=(FW, FH))
ax.set_xlim(0, FW); ax.set_ylim(0, FH)
ax.axis('off')
BG = '#EDEAE4'
fig.patch.set_facecolor(BG); ax.set_facecolor(BG)

# ── Layout constants ──────────────────────────────────────────────────────────
LH  = 0.31   # line height per attribute/method
HH  = 0.92   # header height
PAD = 0.20   # left text padding

# ── Color palette ─────────────────────────────────────────────────────────────
TEAL_H = '#157A5C'; TEAL_B = '#E6F7F0'   # entity
GRN_H  = '#2D7A3A'; GRN_B  = '#ECF9EE'   # model
BLUE_H = '#1A4F94'; BLUE_B = '#D5E8FA'   # hook/motor
PURP_H = '#5C2D91'; PURP_B = '#EDE0FA'   # context/auth
ORG_H  = '#8B4513'; ORG_B  = '#FBF1E3'   # page/view
RED_H  = '#7B1D16'; RED_B  = '#FBE9E6'   # KPI/resultado
GRAY_H = '#3D3D5C'; GRAY_B = '#E8E8F2'   # module/db
AMBT_H = '#7A5010'; AMBT_B = '#FAF3E0'   # enum/type

# ── Helpers ───────────────────────────────────────────────────────────────────
def calc_h(n_attrs, n_meths):
    mpad = 0.28 if n_meths else 0
    return HH + 0.28 + n_attrs * LH + mpad + n_meths * LH + 0.18

def cls_box(x, y, w, name, stereo, attrs, methods, hc, bc, tc='white', mc=None):
    """Draw UML class box. (x,y) = bottom-left. Returns (x, y, w, h) of the box."""
    if mc is None: mc = hc
    h = calc_h(len(attrs), len(methods))

    # body
    ax.add_patch(FancyBboxPatch((x, y), w, h,
        boxstyle='round,pad=0.05', lw=1.8, edgecolor=hc, facecolor=bc, zorder=2))
    # header
    ax.add_patch(FancyBboxPatch((x, y+h-HH), w, HH,
        boxstyle='round,pad=0.05', lw=0, edgecolor=hc, facecolor=hc, zorder=3))

    # stereotype
    if stereo:
        ax.text(x+w/2, y+h-0.24, f'<<{stereo}>>',
            fontsize=8, ha='center', va='center',
            color=tc, style='italic', alpha=0.92, zorder=4)

    # name
    ny = y+h-0.67 if stereo else y+h-HH/2
    ax.text(x+w/2, ny, name,
        fontsize=10.5, fontweight='bold', ha='center', va='center', color=tc, zorder=4)

    # separator attrs
    sy = y+h-HH
    ax.plot([x+0.07, x+w-0.07], [sy, sy], color=hc, lw=0.9, alpha=0.3, zorder=4)

    # attributes
    for i, a in enumerate(attrs):
        ay = sy - 0.22 - i*LH
        ax.text(x+PAD, ay, f'+ {a}', fontsize=8.5,
            ha='left', va='center', color='#120A04',
            fontfamily='monospace', zorder=4)

    # methods
    if methods:
        dy = sy - 0.22 - len(attrs)*LH - 0.12
        ax.plot([x+0.07, x+w-0.07], [dy, dy], color=hc, lw=0.7, alpha=0.3,
            linestyle=':', zorder=4)
        for j, m in enumerate(methods):
            my = dy - 0.19 - j*LH
            ax.text(x+PAD, my, f'+ {m}', fontsize=8.5,
                ha='left', va='center', color=mc,
                fontfamily='monospace', style='italic', zorder=4)

    return (x, y, w, h)


def center_of(box, side='bottom'):
    x, y, w, h = box
    if side == 'bottom':  return (x + w/2, y)
    if side == 'top':     return (x + w/2, y + h)
    if side == 'left':    return (x,       y + h/2)
    if side == 'right':   return (x + w,   y + h/2)

def arr(p1, p2, color='#2D6B4A', dash=False, label='', rad=0.0, lw=1.5):
    """Draw arrow from point p1 to p2."""
    ls = '--' if dash else '-'
    ax.annotate('', xy=p2, xytext=p1,
        arrowprops=dict(
            arrowstyle='->', color=color, lw=lw,
            connectionstyle=f'arc3,rad={rad}',
            linestyle=ls,
        ), zorder=6)
    if label:
        mx, my = (p1[0]+p2[0])/2, (p1[1]+p2[1])/2
        ax.text(mx, my + 0.12, label, fontsize=8, color=color,
            ha='center', va='center', zorder=7,
            bbox=dict(boxstyle='round,pad=0.15', fc=BG, alpha=0.92, ec='none'))

def diam_arr(p1, p2, color='#1A6B52', filled=False, lw=1.5):
    """Composition arrow (diamond head)."""
    ax.annotate('', xy=p2, xytext=p1,
        arrowprops=dict(
            arrowstyle=f'-{">" if filled else ">"}',
            color=color, lw=lw,
            connectionstyle='arc3,rad=0.0',
        ), zorder=6)

# ══════════════════════════════════════════════════════════════════════════════
# TITLE
# ══════════════════════════════════════════════════════════════════════════════
title_box = FancyBboxPatch((6.5, 22.15), 21, 1.0,
    boxstyle='round,pad=0.1', lw=1.5, edgecolor='#5A3810', facecolor='white', zorder=2)
ax.add_patch(title_box)
ax.text(17, 22.65, 'Diagrama de Classes — WK Presentes (Flow)',
    fontsize=15, fontweight='bold', ha='center', va='center',
    color='#2C1810', zorder=3)

# ══════════════════════════════════════════════════════════════════════════════
# ROW 1 — ENTIDADES  (y base ≈ 15.5)
# ══════════════════════════════════════════════════════════════════════════════

# ── Negocio (Business) ───────────────────────────────────────
B_neg = cls_box(0.4, 16.2, 5.0, 'Negocio', 'entidade',
    ['id: str', 'nome: str', 'whatsapp: str',
     'instagram: str', 'plan: str'],
    [],
    TEAL_H, TEAL_B)

# ── Pedido (Order) ───────────────────────────────────────────
B_ped = cls_box(6.5, 15.0, 6.0, 'Pedido', 'entidade',
    ['id: str', 'customer_name: str',
     'source: OrderSource', 'status: OrderStatus',
     'total_value: float', 'custo: float',
     'deadline: date'],
    ['lucro() : float'],
    TEAL_H, TEAL_B, mc=GRN_H)

# ── ItemPedido ───────────────────────────────────────────────
B_item = cls_box(13.5, 17.5, 5.0, 'ItemPedido', 'modelo',
    ['produto: str', 'quantidade: int',
     'valor_unitario: float'],
    [],
    GRN_H, GRN_B)

# ── Cliente ──────────────────────────────────────────────────
B_cli = cls_box(19.5, 15.6, 5.5, 'Cliente', 'entidade',
    ['id: str', 'nome: str', 'telefone: str',
     'instagram: str', 'email: str',
     'total_orders: int', 'total_spent: float'],
    [],
    TEAL_H, TEAL_B)

# ── Produto ──────────────────────────────────────────────────
B_prod = cls_box(26.0, 15.5, 5.5, 'Produto', 'entidade',
    ['id: str', 'nome: str', 'preco: float',
     'custo: float', 'categoria: str',
     'estoque: int', 'status: str'],
    ['margem() : float'],
    TEAL_H, TEAL_B, mc=GRN_H)

# ══════════════════════════════════════════════════════════════════════════════
# ROW 2 — HOOKS / LÓGICA  (y base ≈ 9.5)
# ══════════════════════════════════════════════════════════════════════════════

# ── AuthContext ──────────────────────────────────────────────
B_auth = cls_box(0.4, 10.8, 5.0, 'AuthContext', 'contexto',
    ['session: Session', 'loading: bool'],
    ['signIn() : void', 'signOut() : void',
     'useAuth() : Session'],
    PURP_H, PURP_B)

# ── useOrders ────────────────────────────────────────────────
B_uord = cls_box(6.5, 9.8, 6.0, 'useOrders', 'hook',
    ['orders: List[Pedido]', 'loading: bool'],
    ['createOrder() : void', 'updateStatus() : void',
     'deleteOrder() : void', 'reload() : void'],
    BLUE_H, BLUE_B)

# ── SupabaseClient ───────────────────────────────────────────
B_supa = cls_box(13.5, 11.5, 5.0, 'SupabaseClient', 'módulo',
    ['url: str', 'anonKey: str', 'isConfigured: bool'],
    ['from(table) : Query', 'auth.signUp() : void'],
    GRAY_H, GRAY_B)

# ── useCustomers ─────────────────────────────────────────────
B_ucli = cls_box(19.5, 9.8, 5.5, 'useCustomers', 'hook',
    ['customers: List[Cliente]', 'loading: bool'],
    ['createCustomer() : void', 'updateCustomer() : void',
     'deleteCustomer() : void', 'reload() : void'],
    BLUE_H, BLUE_B)

# ── useProducts ──────────────────────────────────────────────
B_uprd = cls_box(26.0, 9.8, 5.5, 'useProducts', 'hook',
    ['products: List[Produto]', 'loading: bool'],
    ['createProduct() : void', 'updateProduct() : void',
     'deleteProduct() : void', 'reload() : void'],
    BLUE_H, BLUE_B)

# ══════════════════════════════════════════════════════════════════════════════
# ROW 3 — PÁGINAS  (y base ≈ 3.0)
# ══════════════════════════════════════════════════════════════════════════════

# ── Dashboard ────────────────────────────────────────────────
B_dash = cls_box(0.4, 2.8, 5.6, 'Dashboard', 'página',
    ['onNavigate: func', 'onToast: func'],
    ['kpiPedidosHoje() : int', 'kpiPendentes() : int',
     'resumoMensal() : Dict', 'prazosASemana() : List',
     'avançarStatus() : void'],
    ORG_H, ORG_B)

# ── PaginaPedidos ────────────────────────────────────────────
B_ppd = cls_box(7.0, 3.2, 5.5, 'PaginaPedidos', 'página',
    ['filter: OrderStatus', 'search: str'],
    ['filtrarStatus() : List', 'buscarCliente() : List',
     'criarPedido() : void', 'avançarStatus() : void',
     'pipelineVisual: Dict'],
    ORG_H, ORG_B)

# ── PaginaClientes ───────────────────────────────────────────
B_pcl = cls_box(13.5, 3.2, 5.5, 'PaginaClientes', 'página',
    ['search: str'],
    ['buscarCliente() : List', 'criarCliente() : void',
     'topClientes() : List', 'totalFaturado: float',
     'mediaGasto: float'],
    ORG_H, ORG_B)

# ── PaginaProdutos ───────────────────────────────────────────
B_pprd = cls_box(20.0, 3.2, 5.5, 'PaginaProdutos', 'página',
    ['catFilter: str', 'search: str'],
    ['filtrarCategoria() : List', 'criarProduto() : void',
     'alertasEstoque: List', 'margem: Dict',
     'porCategoria: Dict'],
    ORG_H, ORG_B)

# ── PaginaFinanceiro ─────────────────────────────────────────
B_fin = cls_box(26.5, 3.2, 5.0, 'PaginaFinanceiro', 'página',
    [],
    ['historico3Meses() : List', 'topProdutos() : List',
     'totalReceita: float', 'totalCusto: float',
     'ticketMedio: float'],
    ORG_H, ORG_B)

# ══════════════════════════════════════════════════════════════════════════════
# KPIs FINANCEIROS  (y base ≈ 0.3)
# ══════════════════════════════════════════════════════════════════════════════
B_kpi = cls_box(7.0, 0.2, 12.5, 'KPIsFinanceiros', 'resultado',
    ['receita_mes: float', 'custo_mes: float',
     'lucro_mes: float', 'ticket_medio: float', 'margem_lucro: float'],
    ['calcularMargem() : float', 'temAlerta() : bool'],
    RED_H, RED_B)

# ══════════════════════════════════════════════════════════════════════════════
# ARROWS
# ══════════════════════════════════════════════════════════════════════════════

# ── Entity relationships ──────────────────────────────────────────────────────

# Negocio 1:N Pedido
arr(center_of(B_neg, 'right'), center_of(B_ped, 'left'), TEAL_H, label='1:N')

# Negocio 1:N Cliente
arr(center_of(B_neg, 'bottom'),
    (B_neg[0]+B_neg[2]/2, B_cli[1]+B_cli[3]),
    TEAL_H, rad=-0.3, label='1:N', dash=False)

# Negocio 1:N Produto
arr(center_of(B_neg, 'bottom'),
    (B_neg[0]+B_neg[2]/2, B_prod[1]+B_prod[3]),
    TEAL_H, rad=-0.5, label='1:N', dash=False)

# Pedido N:1 Cliente  (Cliente faz Pedido)
arr(center_of(B_cli, 'left'), center_of(B_ped, 'right'),
    '#1A5A3A', dash=True, label='faz', rad=0.0)

# Pedido contém ItemPedido (composição)
arr(center_of(B_ped, 'right'), center_of(B_item, 'left'),
    GRN_H, label='contém 1:N')

# ── Hooks → Entities (dependency, dashed) ────────────────────────────────────

# useOrders → Pedido
arr(center_of(B_uord, 'top'), center_of(B_ped, 'bottom'),
    BLUE_H, dash=True, label='usa')

# useCustomers → Cliente
arr(center_of(B_ucli, 'top'), center_of(B_cli, 'bottom'),
    BLUE_H, dash=True, label='usa')

# useProducts → Produto
arr(center_of(B_uprd, 'top'), center_of(B_prod, 'bottom'),
    BLUE_H, dash=True, label='usa')

# ── All hooks → SupabaseClient ───────────────────────────────────────────────
arr(center_of(B_uord, 'right'), center_of(B_supa, 'left'),
    GRAY_H, dash=True, label='consulta')
arr(center_of(B_ucli, 'left'),
    (B_supa[0]+B_supa[2], B_supa[1]+B_supa[3]*0.5),
    GRAY_H, dash=True)
arr(center_of(B_uprd, 'left'),
    (B_supa[0]+B_supa[2], B_supa[1]+B_supa[3]*0.35),
    GRAY_H, dash=True)

# AuthContext → SupabaseClient
arr(center_of(B_auth, 'right'), center_of(B_supa, 'left'),
    PURP_H, dash=True, label='autentica', rad=0.15)

# ── Pages → Hooks (use) ───────────────────────────────────────────────────────

# Dashboard usa useOrders
arr(center_of(B_dash, 'top'),
    (B_uord[0]+B_uord[2]/2, B_uord[1]),
    ORG_H, dash=True, label='usa', rad=0.15)

# Dashboard usa AuthContext
arr(center_of(B_dash, 'top'),
    (B_auth[0]+B_auth[2]/2, B_auth[1]),
    ORG_H, dash=True, rad=-0.15)

# PaginaPedidos → useOrders
arr(center_of(B_ppd, 'top'), center_of(B_uord, 'bottom'),
    ORG_H, dash=True, label='usa')

# PaginaClientes → useCustomers
arr(center_of(B_pcl, 'top'), center_of(B_ucli, 'bottom'),
    ORG_H, dash=True, label='usa')

# PaginaProdutos → useProducts
arr(center_of(B_pprd, 'top'), center_of(B_uprd, 'bottom'),
    ORG_H, dash=True, label='usa')

# PaginaFinanceiro → useOrders
arr(center_of(B_fin, 'top'),
    (B_uord[0]+B_uord[2], B_uord[1]+B_uord[3]*0.3),
    ORG_H, dash=True, rad=-0.3, label='usa')

# ── KPIs generated by pages ────────────────────────────────────────────────────
arr(center_of(B_dash, 'bottom'),
    (B_kpi[0]+B_kpi[2]*0.25, B_kpi[1]+B_kpi[3]),
    RED_H, label='gera')
arr(center_of(B_fin, 'bottom'),
    (B_kpi[0]+B_kpi[2]*0.75, B_kpi[1]+B_kpi[3]),
    RED_H, label='gera')

# ══════════════════════════════════════════════════════════════════════════════
# LAYER LABELS (background bands)
# ══════════════════════════════════════════════════════════════════════════════
def layer_label(y, text, color):
    ax.text(0.1, y, text, fontsize=8.5, color=color,
        ha='left', va='center', fontweight='bold', alpha=0.55,
        rotation=90)

layer_label(19.0, '[1]  ENTIDADES', TEAL_H)
layer_label(13.5, '[2]  LOGICA / HOOKS', BLUE_H)
layer_label(7.5,  '[3]  PAGINAS / VIEWS', ORG_H)
layer_label(1.8,  '[4]  KPIs / RESULTADOS', RED_H)

# Horizontal dashed dividers
for y_div, c in [(15.0, TEAL_H), (9.8, BLUE_H), (3.0, ORG_H)]:
    ax.plot([0.3, FW-0.3], [y_div, y_div],
        color=c, lw=0.9, alpha=0.2, linestyle='--', zorder=1)

# ══════════════════════════════════════════════════════════════════════════════
# LEGEND
# ══════════════════════════════════════════════════════════════════════════════
leg_x, leg_y, leg_w, leg_h = 0.4, 0.25, 5.8, 2.5
ax.add_patch(FancyBboxPatch((leg_x, leg_y), leg_w, leg_h,
    boxstyle='round,pad=0.1', lw=1.2, edgecolor='#9A8070',
    facecolor='white', alpha=0.9, zorder=10))

ax.text(leg_x + leg_w/2, leg_y + leg_h - 0.28, 'Legenda',
    fontsize=9, fontweight='bold', ha='center', va='center',
    color='#2C1810', zorder=11)

leg_items = [
    (TEAL_H,  'Entidade (dados persistidos)'),
    (GRN_H,   'Modelo / Tipo de dado'),
    (BLUE_H,  'Hook (lógica de dados)'),
    (PURP_H,  'Contexto (autenticação)'),
    (ORG_H,   'Página / View'),
    (RED_H,   'KPI / Resultado'),
    (GRAY_H,  'Módulo externo (Supabase)'),
]
for i, (c, label) in enumerate(leg_items):
    ly = leg_y + leg_h - 0.58 - i * 0.27
    ax.add_patch(mpatches.Rectangle((leg_x+0.18, ly-0.08), 0.3, 0.2,
        color=c, zorder=11))
    ax.text(leg_x+0.62, ly+0.02, label, fontsize=7.8,
        ha='left', va='center', color='#2A1A0A', zorder=11)

# Arrow legend
arr_items = [
    (TEAL_H,  False, '──▶  Composição / Associação'),
    (GRAY_H,  True,  '- - ▶  Dependência (usa)'),
    (RED_H,   False, '──▶  Gera resultado'),
]
# (skip small arrow legend for cleanliness - covered by main arrows)

# ══════════════════════════════════════════════════════════════════════════════
# WATERMARK / caption
# ══════════════════════════════════════════════════════════════════════════════
ax.text(FW-0.3, 0.18, 'Flow Platform — WK Presentes  |  Maio 2026',
    fontsize=8, ha='right', va='bottom', color='#9A8070', style='italic')

# ── Save ──────────────────────────────────────────────────────────────────────
out = 'diagrama_wk_presentes.png'
plt.tight_layout(pad=0.3)
plt.savefig(out, dpi=160, bbox_inches='tight',
    facecolor=BG, edgecolor='none')
print(f'Salvo: {out}')
plt.close()
