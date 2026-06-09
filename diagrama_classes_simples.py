"""
Diagrama de Classes — WK Presentes
Estilo simples, preto e branco, UML clássico.
"""
import matplotlib
matplotlib.use('Agg')
import matplotlib.pyplot as plt
import matplotlib.patches as patches

FW, FH = 20, 14
fig, ax = plt.subplots(figsize=(FW, FH))
ax.set_xlim(0, FW); ax.set_ylim(0, FH)
ax.axis('off')
fig.patch.set_facecolor('white')
ax.set_facecolor('white')

LH   = 0.38   # line height
HDR  = 0.62   # header height
PAD  = 0.18   # left text padding
FONT = 'DejaVu Sans'

# ── Helpers ───────────────────────────────────────────────────────────────────

def class_box(x, y, w, name, attrs, methods):
    """
    Draw a UML class box. (x, y) = bottom-left corner.
    Returns (x, y, w, h, cx, cy_top, cy_bottom, cx_left, cx_right).
    """
    n_attrs  = len(attrs)
    n_meths  = len(methods)
    div_line = 0.08 if n_meths else 0
    h = HDR + 0.18 + n_attrs*LH + div_line + n_meths*LH + 0.15

    # Outer border
    rect = patches.Rectangle((x, y), w, h,
        linewidth=1.5, edgecolor='black', facecolor='white', zorder=2)
    ax.add_patch(rect)

    # Header fill (light gray)
    hdr = patches.Rectangle((x, y+h-HDR), w, HDR,
        linewidth=0, edgecolor='black', facecolor='#E8E8E8', zorder=3)
    ax.add_patch(hdr)

    # Header border bottom
    ax.plot([x, x+w], [y+h-HDR, y+h-HDR], color='black', lw=1.5, zorder=4)

    # Class name
    ax.text(x + w/2, y + h - HDR/2, name,
        ha='center', va='center', fontsize=11,
        fontweight='bold', color='black', zorder=4, fontfamily=FONT)

    # Attributes
    for i, a in enumerate(attrs):
        ay = y + h - HDR - 0.15 - i*LH
        ax.text(x + PAD, ay, a,
            ha='left', va='center', fontsize=9,
            color='black', zorder=4, fontfamily='monospace')

    # Methods divider
    if n_meths:
        div_y = y + h - HDR - 0.15 - n_attrs*LH - 0.06
        ax.plot([x, x+w], [div_y, div_y], color='black', lw=1.0, zorder=4)
        for j, m in enumerate(methods):
            my = div_y - 0.1 - j*LH
            ax.text(x + PAD, my, m,
                ha='left', va='center', fontsize=9,
                color='black', zorder=4, fontfamily='monospace',
                style='italic')

    cx = x + w/2
    return dict(x=x, y=y, w=w, h=h,
                top=(cx, y+h), bottom=(cx, y),
                left=(x, y+h/2), right=(x+w, y+h/2),
                cx=cx, cy=y+h/2)


def line(p1, p2, label='', dash=False, label_offset=(0, 0.15)):
    """Draw a simple line between two points."""
    ls = '--' if dash else '-'
    ax.plot([p1[0], p2[0]], [p1[1], p2[1]],
        color='black', lw=1.3, linestyle=ls, zorder=5)
    if label:
        mx = (p1[0]+p2[0])/2 + label_offset[0]
        my = (p1[1]+p2[1])/2 + label_offset[1]
        ax.text(mx, my, label,
            ha='center', va='center', fontsize=8.5,
            color='black', style='italic',
            bbox=dict(boxstyle='round,pad=0.1', fc='white', ec='none'))


def arrow_line(p1, p2, label='', dash=False, label_side='right'):
    """Arrow from p1 to p2."""
    ls = '--' if dash else '-'
    ax.annotate('', xy=p2, xytext=p1,
        arrowprops=dict(
            arrowstyle='->', color='black', lw=1.3, linestyle=ls
        ), zorder=5)
    if label:
        off = 0.22 if label_side == 'right' else -0.22
        mx = (p1[0]+p2[0])/2 + off
        my = (p1[1]+p2[1])/2
        ax.text(mx, my, label, ha='center', va='center', fontsize=8.5,
            color='black', style='italic',
            bbox=dict(boxstyle='round,pad=0.1', fc='white', ec='none'))


def mult(x, y, text):
    """Multiplicity label."""
    ax.text(x, y, text, ha='center', va='center',
        fontsize=8, color='black', fontfamily=FONT)


# ══════════════════════════════════════════════════════════════════════════════
# CLASSES
# ══════════════════════════════════════════════════════════════════════════════

# ── Negocio (top center) ──────────────────────────────────────────────────────
neg = class_box(7.0, 10.5, 6.0, 'Negocio',
    ['- id: String', '- nome: String',
     '- whatsapp: String', '- plan: String'],
    [])

# ── Pedido (center-left) ──────────────────────────────────────────────────────
ped = class_box(0.8, 5.5, 6.2, 'Pedido',
    ['- id: String', '- status: OrderStatus',
     '- source: OrderSource', '- total_value: Float',
     '- custo: Float', '- deadline: Date'],
    ['+ lucro(): Float', '+ avançarStatus(): void'])

# ── Cliente (center) ──────────────────────────────────────────────────────────
cli = class_box(7.5, 5.5, 5.2, 'Cliente',
    ['- id: String', '- nome: String',
     '- telefone: String', '- instagram: String',
     '- total_orders: Int', '- total_spent: Float'],
    [])

# ── Produto (center-right) ────────────────────────────────────────────────────
prd = class_box(13.6, 5.5, 5.6, 'Produto',
    ['- id: String', '- nome: String',
     '- preco: Float', '- custo: Float',
     '- categoria: String', '- estoque: Int',
     '- status: String'],
    ['+ margem(): Float'])

# ── ItemPedido (bottom center-left) ───────────────────────────────────────────
itm = class_box(3.0, 1.0, 5.0, 'ItemPedido',
    ['- produto: String', '- quantidade: Int',
     '- valor_unitario: Float'],
    [])

# ══════════════════════════════════════════════════════════════════════════════
# RELATIONSHIPS
# ══════════════════════════════════════════════════════════════════════════════

# Negocio 1 ──────── * Pedido
p1 = neg['bottom']
p2 = ped['top']
ax.plot([p1[0], p2[0]], [p1[1], p2[1]], 'k-', lw=1.3, zorder=5)
mult(p1[0]-0.3, p1[1]-0.2, '1')
mult(p2[0]-0.3, p2[1]+0.2, '*')

# Negocio 1 ──────── * Cliente
p1 = (neg['cx'], neg['y'])
p2 = cli['top']
ax.plot([p1[0], p2[0]], [p1[1], p2[1]], 'k-', lw=1.3, zorder=5)
mult(p1[0]+0.25, p1[1]-0.2, '1')
mult(p2[0]-0.3, p2[1]+0.2, '*')

# Negocio 1 ──────── * Produto
p1 = neg['bottom']
p2 = prd['top']
ax.plot([p1[0], p2[0]], [p1[1], p2[1]], 'k-', lw=1.3, zorder=5)
mult(p1[0]+0.3, p1[1]-0.2, '1')
mult(p2[0]-0.3, p2[1]+0.2, '*')

# Cliente 1 ──────── * Pedido  (horizontal)
p1 = cli['left']
p2 = ped['right']
ax.plot([p1[0], p2[0]], [p1[1], p2[1]], 'k-', lw=1.3, zorder=5)
mult(p1[0]-0.25, p1[1]+0.15, '1')
mult(p2[0]+0.25, p2[1]+0.15, '*')
ax.text((p1[0]+p2[0])/2, p1[1]+0.25, 'realiza',
    ha='center', va='bottom', fontsize=8.5, style='italic', color='black')

# Pedido 1 ──────── * ItemPedido
p1 = ped['bottom']
p2 = itm['top']
ax.plot([p1[0], p2[0]], [p1[1], p2[1]], 'k-', lw=1.3, zorder=5)
mult(p1[0]-0.3, p1[1]-0.22, '1')
mult(p2[0]+0.3, p2[1]+0.22, '*')
ax.text((p1[0]+p2[0])/2 + 0.4, (p1[1]+p2[1])/2, 'contém',
    ha='left', va='center', fontsize=8.5, style='italic', color='black')

# ItemPedido * ──────── 1 Produto  (dashed, dependency)
p1 = itm['right']
p2 = (prd['x'], prd['y'] + prd['h']*0.15)
ax.plot([p1[0], p2[0]], [p1[1], p2[1]], 'k--', lw=1.3, zorder=5)
mult(p1[0]+0.2, p1[1]+0.18, '*')
mult(p2[0]-0.3, p2[1]+0.15, '1')
ax.text((p1[0]+p2[0])/2, (p1[1]+p2[1])/2 + 0.22, 'referencia',
    ha='center', va='bottom', fontsize=8.5, style='italic', color='black')

# ══════════════════════════════════════════════════════════════════════════════
# TITLE
# ══════════════════════════════════════════════════════════════════════════════
ax.text(FW/2, FH - 0.55, 'DIAGRAMA DE CLASSES — WK PRESENTES',
    ha='center', va='center', fontsize=16, fontweight='bold',
    color='black', fontfamily=FONT)

ax.plot([1.5, FW-1.5], [FH-0.85, FH-0.85], 'k-', lw=1.2)

# ══════════════════════════════════════════════════════════════════════════════
# SAVE
# ══════════════════════════════════════════════════════════════════════════════
plt.savefig('diagrama_classes_simples.png', dpi=160,
    bbox_inches='tight', facecolor='white', edgecolor='none')
print('Salvo: diagrama_classes_simples.png')
plt.close()
