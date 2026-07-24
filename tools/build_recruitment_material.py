from pathlib import Path

from reportlab.lib import colors
from reportlab.lib.enums import TA_CENTER, TA_LEFT
from reportlab.lib.pagesizes import A4
from reportlab.lib.styles import ParagraphStyle, getSampleStyleSheet
from reportlab.lib.units import mm
from reportlab.pdfbase import pdfmetrics
from reportlab.pdfbase.ttfonts import TTFont
from reportlab.platypus import (
    Flowable,
    Image,
    KeepTogether,
    PageBreak,
    Paragraph,
    SimpleDocTemplate,
    Spacer,
    Table,
    TableStyle,
)


ROOT = Path(__file__).resolve().parents[1]
OUT = ROOT / "assets/docs/recruitment-material.pdf"
QR = ROOT / "assets/images/survey-qrcode.png"
FONT = "/System/Library/Fonts/Supplemental/Arial Unicode.ttf"
FONT_NAME = "ArialUnicode"

SURVEY_URL = "https://imperial.eu.qualtrics.com/jfe/form/SV_9uJEkjaO7ezP7wO"
CONTACT = "Yao Xiao - yxiao3@ic.ac.uk"
VERSION = "Version: v3.3 | Date: 22/07/2026"
SETREC = "SETREC reference: 8515214"


class HR(Flowable):
    def __init__(self, width=170 * mm, color=colors.HexColor("#d7d0c4")):
        super().__init__()
        self.width = width
        self.height = 1
        self.color = color

    def draw(self):
        self.canv.setStrokeColor(self.color)
        self.canv.setLineWidth(0.7)
        self.canv.line(0, 0, self.width, 0)


class Pill(Flowable):
    def __init__(self, text, style, width=112 * mm, height=9 * mm):
        super().__init__()
        self.text = text
        self.style = style
        self.width = width
        self.height = height

    def draw(self):
        self.canv.setFillColor(colors.HexColor("#12385c"))
        self.canv.roundRect(0, 0, self.width, self.height, 4.5 * mm, stroke=0, fill=1)
        para = Paragraph(self.text, self.style)
        w, h = para.wrap(self.width - 10 * mm, self.height)
        para.drawOn(self.canv, 5 * mm, (self.height - h) / 2)


class BoxedContent(Flowable):
    def __init__(self, children, width=170 * mm, padding=6 * mm, radius=5 * mm, gap=2 * mm):
        super().__init__()
        self.children = children
        self.width = width
        self.padding = padding
        self.radius = radius
        self.gap = gap
        self.height = 0
        self._sizes = []

    def wrap(self, avail_width, avail_height):
        inner_width = self.width - (2 * self.padding)
        self._sizes = []
        total = self.padding
        for child in self.children:
            w, h = child.wrap(inner_width, avail_height)
            self._sizes.append((w, h))
            total += h + self.gap
        total += self.padding - self.gap
        self.height = total
        return self.width, self.height

    def draw(self):
        self.canv.setFillColor(colors.white)
        self.canv.setStrokeColor(colors.HexColor("#c8d7e2"))
        self.canv.setLineWidth(1.15)
        self.canv.roundRect(0, 0, self.width, self.height, self.radius, stroke=1, fill=1)
        y = self.height - self.padding
        inner_width = self.width - (2 * self.padding)
        for child, (_, h) in zip(self.children, self._sizes):
            y -= h
            child.drawOn(self.canv, self.padding, y)
            y -= self.gap


class TopGraphic(Flowable):
    def __init__(self, width=52 * mm, height=20 * mm):
        super().__init__()
        self.width = width
        self.height = height

    def draw(self):
        c = self.canv
        c.setStrokeColor(colors.HexColor("#12385c"))
        c.setLineWidth(1.1)
        x = 3 * mm
        c.rect(x, 4 * mm, 10 * mm, 12 * mm, stroke=1, fill=0)
        c.rect(x + 10 * mm, 4 * mm, 11 * mm, 16 * mm, stroke=1, fill=0)
        c.line(x - 7 * mm, 4 * mm, x + 33 * mm, 4 * mm)
        c.line(x + 24 * mm, 13 * mm, x + 50 * mm, 4 * mm)
        c.circle(x + 21 * mm, 4 * mm, 2.4 * mm, stroke=1, fill=0)
        c.circle(x + 35 * mm, 9 * mm, 6.5 * mm, stroke=1, fill=0)
        c.circle(x + 48 * mm, 4 * mm, 2.8 * mm, stroke=1, fill=0)


def register_fonts():
    pdfmetrics.registerFont(TTFont(FONT_NAME, FONT))


def styles():
    base = getSampleStyleSheet()
    ink = colors.HexColor("#132339")
    muted = colors.HexColor("#24384d")
    accent = colors.HexColor("#12385c")
    pale = colors.HexColor("#f3f7f8")

    return {
        "kicker": ParagraphStyle(
            "kicker",
            parent=base["Normal"],
            fontName=FONT_NAME,
            fontSize=9,
            leading=11,
            textColor=accent,
            uppercase=True,
            spaceAfter=4,
        ),
        "title": ParagraphStyle(
            "title",
            parent=base["Title"],
            fontName=FONT_NAME,
            fontSize=25,
            leading=30,
            textColor=ink,
            spaceAfter=6,
        ),
        "poster_title": ParagraphStyle(
            "poster_title",
            parent=base["Title"],
            fontName=FONT_NAME,
            fontSize=22,
            leading=26,
            alignment=TA_LEFT,
            textColor=ink,
            spaceAfter=6,
        ),
        "subtitle": ParagraphStyle(
            "subtitle",
            parent=base["Normal"],
            fontName=FONT_NAME,
            fontSize=12,
            leading=15,
            textColor=muted,
            spaceAfter=8,
        ),
        "h2": ParagraphStyle(
            "h2",
            parent=base["Heading2"],
            fontName=FONT_NAME,
            fontSize=13,
            leading=16,
            textColor=ink,
            spaceBefore=4,
            spaceAfter=5,
        ),
        "body": ParagraphStyle(
            "body",
            parent=base["BodyText"],
            fontName=FONT_NAME,
            fontSize=9.6,
            leading=12.8,
            textColor=muted,
            spaceAfter=5,
        ),
        "small": ParagraphStyle(
            "small",
            parent=base["BodyText"],
            fontName=FONT_NAME,
            fontSize=8.1,
            leading=10.2,
            textColor=muted,
        ),
        "center_small": ParagraphStyle(
            "center_small",
            parent=base["BodyText"],
            fontName=FONT_NAME,
            fontSize=7.5,
            leading=9.5,
            textColor=muted,
            alignment=TA_CENTER,
        ),
        "card": ParagraphStyle(
            "card",
            parent=base["BodyText"],
            fontName=FONT_NAME,
            fontSize=8.8,
            leading=11.4,
            textColor=muted,
        ),
        "card_h": ParagraphStyle(
            "card_h",
            parent=base["Heading3"],
            fontName=FONT_NAME,
            fontSize=12,
            leading=14,
            textColor=ink,
            spaceAfter=4,
        ),
        "footer": ParagraphStyle(
            "footer",
            parent=base["BodyText"],
            fontName=FONT_NAME,
            fontSize=7.5,
            leading=9.5,
            textColor=muted,
        ),
        "pill": ParagraphStyle(
            "pill",
            parent=base["BodyText"],
            fontName=FONT_NAME,
            fontSize=8,
            leading=9,
            alignment=TA_CENTER,
            textColor=colors.white,
        ),
        "button_h": ParagraphStyle(
            "button_h",
            parent=base["BodyText"],
            fontName=FONT_NAME,
            fontSize=8,
            leading=9,
            alignment=TA_CENTER,
            textColor=accent,
        ),
        "comm_title": ParagraphStyle(
            "comm_title",
            parent=base["Title"],
            fontName=FONT_NAME,
            fontSize=17,
            leading=20.5,
            alignment=TA_CENTER,
            textColor=ink,
            spaceAfter=4,
        ),
        "comm_h2": ParagraphStyle(
            "comm_h2",
            parent=base["Heading2"],
            fontName=FONT_NAME,
            fontSize=10,
            leading=12,
            textColor=ink,
            spaceBefore=2,
            spaceAfter=3,
        ),
        "comm_body": ParagraphStyle(
            "comm_body",
            parent=base["BodyText"],
            fontName=FONT_NAME,
            fontSize=7.3,
            leading=9.1,
            textColor=muted,
            spaceAfter=3,
        ),
        "panel_bg": pale,
    }


def p(text, style):
    return Paragraph(text, style)


def bullet_list(items, style):
    return [p(f"• {item}", style) for item in items]


def card(title, body_items, s):
    content = [p(title, s["card_h"])]
    for item in body_items:
        content.append(p(item, s["card"]))
    return content


def footer(story, s, compact=False):
    story.append(Spacer(1, 4 * mm))
    story.append(HR(color=colors.HexColor("#12385c")))
    story.append(Spacer(1, 3 * mm))
    if compact:
        story.append(p(f"Imperial College London - Dyson School of Design Engineering | Contact: {CONTACT} | {SETREC} | {VERSION}", s["footer"]))
        return
    story.append(p("Imperial College London - Dyson School of Design Engineering", s["footer"]))
    story.append(p(f"Contact: {CONTACT} - {SETREC}", s["footer"]))
    story.append(p(VERSION, s["footer"]))


def qr_block(s):
    qr = Image(str(QR), width=28 * mm, height=28 * mm)
    return [
        qr,
        Spacer(1, 2 * mm),
        p("Scan for survey", s["center_small"]),
        p("Qualtrics survey", s["center_small"]),
    ]


def draw_page_background(canv, doc):
    canv.saveState()
    canv.setFillColor(colors.HexColor("#f3f7f8"))
    canv.rect(0, 0, A4[0], A4[1], stroke=0, fill=1)
    canv.restoreState()


def poster_page(story, s, lang, title, subtitle, intro, eligibility_title, eligibility, survey_title, survey_items, interview_title, interview_items, important_title, important_items, include_qr=True):
    header = Table(
        [[[p("IMPERIAL COLLEGE LONDON", s["kicker"]), p("Dyson School of Design Engineering", s["small"])], TopGraphic()]],
        colWidths=[112 * mm, 58 * mm],
        hAlign="LEFT",
    )
    header.setStyle(TableStyle([
        ("VALIGN", (0, 0), (-1, -1), "TOP"),
        ("LEFTPADDING", (0, 0), (-1, -1), 0),
        ("RIGHTPADDING", (0, 0), (-1, -1), 0),
        ("TOPPADDING", (0, 0), (-1, -1), 0),
        ("BOTTOMPADDING", (0, 0), (-1, -1), 0),
    ]))
    story.append(header)
    story.append(Spacer(1, 5 * mm))
    story.append(p(title, s["poster_title"]))
    pill_width = 142 * mm if lang == "ja" else min(142 * mm, max(92 * mm, len(subtitle) * 2.2 * mm))
    story.append(Pill(subtitle, s["pill"], width=pill_width))
    story.append(Spacer(1, 5 * mm))
    story.append(BoxedContent([p(intro, s["body"])], width=170 * mm, padding=6 * mm))

    left = BoxedContent([p(eligibility_title, s["h2"])] + bullet_list(eligibility, s["card"]), width=74 * mm, padding=5 * mm)
    middle = BoxedContent(card(survey_title, survey_items, s) + [Spacer(1, 3 * mm)] + card(interview_title, interview_items, s), width=74 * mm, padding=5 * mm)
    data = [[left, middle]]
    widths = [78 * mm, 78 * mm]
    if include_qr:
        data[0].append(BoxedContent(qr_block(s), width=32 * mm, padding=3 * mm, radius=4 * mm))
        widths.append(34 * mm)

    table = Table(data, colWidths=widths, hAlign="LEFT")
    table.setStyle(TableStyle([
        ("VALIGN", (0, 0), (-1, -1), "TOP"),
        ("LEFTPADDING", (0, 0), (-1, -1), 0),
        ("RIGHTPADDING", (0, 0), (-1, -1), 4),
        ("TOPPADDING", (0, 0), (-1, -1), 0),
        ("BOTTOMPADDING", (0, 0), (-1, -1), 0),
    ]))
    story.append(Spacer(1, 5 * mm))
    story.append(table)

    story.append(Spacer(1, 6 * mm))
    story.append(BoxedContent([p(important_title, s["h2"])] + bullet_list(important_items, s["body"]), width=170 * mm, padding=5 * mm))
    footer(story, s)
    story.append(PageBreak())


def invitation_page(
    story,
    s,
    lang_name,
    heading,
    paragraphs,
    eligibility_heading,
    eligibility,
    link_label,
    contact_label,
    email_heading,
    email_paragraphs,
):
    story.append(p("Recruitment and participant communication text", s["kicker"]))
    story.append(p(lang_name, s["small"]))
    story.append(Spacer(1, 3 * mm))
    story.append(p(heading, s["comm_title"]))
    for para in paragraphs:
        story.append(p(para, s["comm_body"]))
    story.append(Spacer(1, 2 * mm))
    story.append(p(eligibility_heading, s["comm_h2"]))
    story.extend(bullet_list(eligibility, s["comm_body"]))
    story.append(Spacer(1, 2 * mm))
    story.append(p(f"{link_label}: {SURVEY_URL}", s["comm_body"]))
    story.append(p(f"{contact_label}: {CONTACT}", s["comm_body"]))
    story.append(Spacer(1, 2 * mm))
    story.append(BoxedContent(
        [p(email_heading, s["comm_h2"])] + [p(para, s["comm_body"]) for para in email_paragraphs],
        width=170 * mm,
        padding=3 * mm,
        radius=3 * mm,
        gap=1 * mm,
    ))
    footer(story, s, compact=True)
    story.append(PageBreak())


def build():
    register_fonts()
    s = styles()
    doc = SimpleDocTemplate(
        str(OUT),
        pagesize=A4,
        rightMargin=15 * mm,
        leftMargin=15 * mm,
        topMargin=15 * mm,
        bottomMargin=13 * mm,
        title="Appendix 0 Recruitment Material",
    )
    story = []

    story.append(p("Note for ethics reviewer", s["title"]))
    story.append(p(
        "This recruitment material is formatted as poster/PDF layout, so tracked changes cannot be shown directly in the document. The main updates in this version are summarised below.",
        s["body"],
    ))
    story.append(Spacer(1, 4 * mm))
    story.append(p("Summary of changes", s["h2"]))
    story.extend(bullet_list([
        "Updated version number and date to v3.3, 22/07/2026.",
        "Aligned eligibility wording across the recruitment webpage and downloadable recruitment material.",
        "Added the eligibility criterion that participants currently hold a valid visa or legal status to reside in the UK, of any category including work, study, residency, or citizenship.",
        "Removed the previous exclusion sentence about specific study activities.",
        "Updated the Korean survey invitation text using revised wording.",
        "Revised the expert informant recruitment heading to use broader wording: cross-cultural support, technology, and AI perspectives.",
        "Updated interview durations: migrant participant interviews are around 45 minutes, up to 60 minutes; expert informant interviews are around 60 minutes, up to 90 minutes.",
        "Updated the expert informant description to include relevant professional, research, policy, design, AI ethics, AI product, and practice-based expertise.",
        "Added the Qualtrics survey link and QR code.",
        "Restored interview eligibility confirmation and scheduling email text for ethics application use.",
    ], s["body"]))
    footer(story, s)
    story.append(PageBreak())

    eligibility_en = [
        "You are aged between 20-65.",
        "You were born outside the UK, and the UK is currently one of your main places of residence.",
        "You spent most of your childhood and teenage years in an East Asian cultural environment, such as mainland China, Hong Kong, Macau, Taiwan, Japan, South Korea, or an East Asian diaspora community elsewhere, such as in Southeast Asia.",
        "You have lived in the UK for at least six months.",
        "You currently hold a valid visa or legal status to reside in the UK, of any category including work, study, residency, or citizenship.",
    ]

    poster_page(
        story,
        s,
        "en",
        "Are you an East Asian migrant living in the UK?",
        "Phase 1 Discovery Study - Online Survey and One-to-One Interview",
        "This PhD study explores relationships, belonging, support needs, and everyday use of digital tools or AI among first-generation East Asian migrants in the UK.",
        "Who can take part",
        eligibility_en,
        "Online survey",
        [
            "15-20 minutes: answer anonymous questions about migration, belonging, help-seeking, digital tools, and AI views.",
            "Optional prize draw: 5 x £20 vouchers.",
        ],
        "Optional one-to-one interview",
        [
            "Around 45 minutes, up to 60 minutes: online or in an approved private setting.",
            "Talk in more detail about your experiences. Participants receive a £15 voucher.",
        ],
        "Important information",
        [
            "You may do the survey only, the interview only, or both.",
            "Participation is voluntary. You may skip questions, pause, stop, or withdraw.",
            "No clinical, legal, or immigration advice will be provided.",
        ],
    )

    eligibility_zh_cn = [
        "年龄在 20-65 岁之间。",
        "你出生在英国以外，目前英国是你的主要居住地之一。",
        "你的童年和青少年时期大部分时间是在东亚文化环境中度过，例如中国大陆、香港、澳门、台湾、日本、韩国，或其他地区的东亚侨民/社群（例如东南亚）。",
        "你已在英国居住至少六个月。",
        "你目前持有在英国居住的有效签证或合法身份（任何类别，包括工作、学习、居留或公民身份）。",
    ]
    poster_page(
        story, s, "zh-cn",
        "在英国生活的你，我们想听见你的经验",
        "第一阶段探索研究 - 线上问卷和一对一访谈",
        "这项博士研究希望了解第一代东亚移民在英国如何维持关系、寻求支持，以及如何使用数字工具或 AI。",
        "谁可以参加", eligibility_zh_cn,
        "线上问卷", ["约 15-20 分钟：匿名回答关于移民经历、归属感、求助经验、数字工具和 AI 看法的问题。", "可自愿参加 5 份 £20 礼券抽奖。"],
        "可选一对一访谈", ["约 45 分钟，最长 60 分钟：线上或在获批准的私密场所进行。", "更详细地分享你的经历。访谈参与者可获得 £15 礼券。"],
        "重要信息", ["你可以只参加问卷、只参加访谈，或两者都参加。", "参与完全自愿。你可以跳过问题、暂停、停止或退出。", "本研究不会提供临床、法律或移民建议。"],
    )

    eligibility_zh_tw = [
        "年齡在 20-65 歲之間。",
        "你在英國以外出生，目前英國是你的主要居住地之一。",
        "你的童年和青少年時期大部分時間是在東亞文化環境中度過，例如中國大陸、香港、澳門、台灣、日本、韓國，或其他地區的東亞僑民/社群（例如東南亞）。",
        "你已在英國居住至少六個月。",
        "你目前持有在英國居住的有效簽證或合法身份（任何類別，包括工作、學習、居留或公民身份）。",
    ]
    poster_page(
        story, s, "zh-tw",
        "在英國生活的你，我們希望聽到你的經驗",
        "第一階段探索研究 - 網上問卷與一對一訪談",
        "這項博士研究希望了解第一代東亞移民在英國如何維持關係、尋求支持，以及如何使用數碼工具或 AI。",
        "誰可以參加", eligibility_zh_tw,
        "網上問卷", ["約 15-20 分鐘：匿名回答關於移民經驗、歸屬感、求助經驗、數碼工具和 AI 看法的問題。", "可自願參加 5 份 £20 禮券抽獎。"],
        "可選一對一訪談", ["約 45 分鐘，最長 60 分鐘：網上或在獲批准的私密場所進行。", "更詳細地分享你的經驗。訪談參與者可獲得 £15 禮券。"],
        "重要資訊", ["你可以只參加問卷、只參加訪談，或兩者都參加。", "參與完全自願。你可以跳過問題、暫停、停止或退出。", "本研究不會提供臨床、法律或移民建議。"],
    )

    eligibility_ja = [
        "年齢が20歳から65歳であること。",
        "英国外で生まれ、現在英国が主な居住地の一つであること。",
        "幼少期および10代の大部分を東アジア文化環境（中国本土、香港、マカオ、台湾、日本、韓国、またはその他の地域の東アジア系ディアスポラ・コミュニティなど）で過ごしたこと。",
        "英国に少なくとも6か月以上居住していること。",
        "現在、英国に居住するための有効なビザまたは合法的な在留資格を持っていること（就労、就学、永住権、市民権など、種類は問いません）。",
    ]
    poster_page(
        story, s, "ja",
        "英国で暮らすあなたの経験を聞かせてください",
        "【第1フェーズ探索研究】オンラインアンケートと個別インタビュー",
        "本研究（博士研究）は、英国在住の第一世代東アジア系移民が、人間関係を維持し、支援を求め、日常生活でデジタルツールやAIをどのように活用しているかを理解することを目的としています。",
        "対象となる方", eligibility_ja,
        "オンラインアンケート<br/>（約15〜20分）", ["移民経験、帰属意識、支援の求め方、デジタルツールやAIへの考えについて匿名で回答します。", "任意で £20 ギフト券が当たる抽選（5名様）に参加できます。"],
        "任意の個別インタビュー<br/>（約45分、最長60分）", ["オンラインまたは承認された私的な場所で実施します。", "ご自身の経験をより詳しくお聞かせください。参加者には £15 のギフト券を進呈します。"],
        "重要な注意事項", ["アンケートのみ、インタビューのみ、または両方の参加が可能です。", "参加は完全に任意です。質問を飛ばす、一時中断する、回答を撤回することができます。", "本研究では、臨床、法律、移民に関する助言は行いません。"],
    )

    eligibility_ko = [
        "만 20-65세입니다.",
        "영국 밖에서 태어났으며, 현재 영국이 주요 거주지 중 하나입니다.",
        "어린 시절과 청소년기의 대부분을 중국 본토, 홍콩, 마카오, 대만, 일본, 한국 또는 동남아시아 등 다른 지역의 동아시아 디아스포라 공동체와 같은 동아시아 문화 환경에서 보냈습니다.",
        "영국에서 최소 6개월 이상 거주했습니다.",
        "현재 영국에 거주할 수 있는 유효한 비자 또는 합법적 체류 자격을 보유하고 있습니다(취업, 학업, 거주, 시민권 등 모든 유형 포함).",
    ]
    poster_page(
        story, s, "ko",
        "영국에서의 경험을 들려주세요",
        "1단계 탐색 연구 - 온라인 설문 및 일대일 인터뷰",
        "본 연구는 임페리얼 칼리지 런던 박사과정 연구의 첫 번째 탐색 단계입니다. 영국에서 생활하며 경험하는 인간관계와 소속감, 도움이 필요할 때 지원을 구하는 방식, 일상에서 디지털 도구와 인공지능(AI)을 사용하는 경험을 알아보고자 합니다.",
        "참여 대상", eligibility_ko,
        "온라인 설문", ["약 15-20분 동안 익명 온라인 설문에 응답합니다. 설문은 이민 경험, 소속감, 필요한 도움과 지원, 디지털 도구 사용 경험, AI 기반 지원 서비스에 대한 생각을 질문합니다.", "희망하시는 경우 £20 상당의 상품권 추첨에 응모하실 수 있습니다(총 5명 추첨)."],
        "선택적 일대일 인터뷰", ["약 45분, 최대 60분 동안 온라인 또는 승인된 사적인 장소에서 진행됩니다.", "경험을 더 자세히 이야기합니다. 인터뷰 참여자는 £15 상품권을 받습니다."],
        "중요 안내", ["설문만, 인터뷰만, 또는 둘 다 참여할 수 있습니다.", "참여는 전적으로 자발적입니다. 질문을 건너뛰거나, 일시 중지하거나, 중단하거나, 철회할 수 있습니다.", "본 연구는 임상, 법률 또는 이민 관련 조언을 제공하지 않습니다."],
    )

    # Expert poster
    expert_header = Table(
        [[[p("IMPERIAL COLLEGE LONDON", s["kicker"]), p("Dyson School of Design Engineering", s["small"])], TopGraphic()]],
        colWidths=[112 * mm, 58 * mm],
        hAlign="LEFT",
    )
    expert_header.setStyle(TableStyle([
        ("VALIGN", (0, 0), (-1, -1), "TOP"),
        ("LEFTPADDING", (0, 0), (-1, -1), 0),
        ("RIGHTPADDING", (0, 0), (-1, -1), 0),
        ("TOPPADDING", (0, 0), (-1, -1), 0),
        ("BOTTOMPADDING", (0, 0), (-1, -1), 0),
    ]))
    story.append(expert_header)
    story.append(Spacer(1, 5 * mm))
    story.append(p("Cross-cultural support, technology, and AI perspectives", s["poster_title"]))
    story.append(Pill("Phase 1 Discovery Study - Expert Informant Interview", s["pill"], width=110 * mm))
    story.append(Spacer(1, 5 * mm))
    story.append(BoxedContent([p("We are looking for expert informants to take part in a research interview about how AI-supported tools might help people navigate cultural differences, support needs, and relationships across migration.", s["body"])], width=170 * mm, padding=6 * mm))
    expert_left = BoxedContent([p("You may be eligible if you have experience in", s["h2"])] + bullet_list([
        "Cross-cultural support; migrant or community support; counselling or wellbeing.",
        "Legal, immigration, housing, health, or student support policy.",
        "HCI/design, AI ethics, conversational AI, AI product practice, entrepreneurship, research, or related practice-based work.",
        "You do not need lived migration experience, direct experience supporting East Asian communities, or UK-based experience, provided your expertise is relevant.",
    ], s["card"]), width=82 * mm, padding=5 * mm)
    expert_right = BoxedContent(card("One-to-one expert interview", [
        "Format: online or in person.",
        "Duration: around 60 minutes, up to 90 minutes.",
        "The interview will discuss your professional or practice-based observations.",
        "It may include short fictional scenarios and AI response examples to explore appropriate AI roles, cultural attunement, boundaries, handoff, referral, and when AI should step back.",
        "Audio recording is optional and only happens with separate consent. Participants receive a £30 voucher.",
    ], s), width=82 * mm, padding=5 * mm)
    table = Table([[expert_left, expert_right]], colWidths=[85 * mm, 85 * mm], hAlign="LEFT")
    table.setStyle(TableStyle([
        ("VALIGN", (0, 0), (-1, -1), "TOP"),
        ("LEFTPADDING", (0, 0), (-1, -1), 0),
        ("RIGHTPADDING", (0, 0), (-1, -1), 4),
        ("TOPPADDING", (0, 0), (-1, -1), 0),
        ("BOTTOMPADDING", (0, 0), (-1, -1), 0),
    ]))
    story.append(Spacer(1, 7 * mm))
    story.append(table)
    story.append(Spacer(1, 6 * mm))
    story.append(BoxedContent([p("Important information", s["h2"])] + bullet_list([
        "Participation is voluntary. You may skip questions, pause, stop, or withdraw.",
        "This is a single expert interview.",
        "No live AI system, prototype, or real user case will be involved.",
        "No clinical, legal, or immigration advice will be provided.",
    ], s["body"]), width=170 * mm, padding=5 * mm))
    footer(story, s)
    story.append(PageBreak())

    invitation_page(
        story, s, "English", "Survey invitation / social media or group-circulation text",
        [
            "Are you an East Asian migrant living in the UK? We are inviting first-generation East Asian migrants to take part in a Phase 1 PhD study at Imperial College London about relationships, belonging, help-seeking, and everyday use of digital tools or AI.",
            "You will complete an anonymous online survey lasting about 15-20 minutes. The survey asks about migration experience, belonging, support needs, digital tools, and views on AI-supported services.",
            "After submitting the survey, you may optionally enter a prize draw for 5 x £20 vouchers and/or leave contact details for future study contact. The Participant Information Sheet is provided at the start of the survey before consent. Participation is voluntary.",
        ],
        "Eligibility", eligibility_en, "Survey link", "Contact",
        "Interview eligibility confirmation and scheduling email text",
        [
            "Dear [Name],",
            "Thank you for your interest in this study. Based on your screening responses, you appear eligible to take part in an interview. Please review the Participant Information Sheet and consent form, either attached or linked, at least 24 hours before the interview.",
            "What you will do: take part in one interview, either online or in an approved private setting. Migrant participant interviews last around 45 minutes, up to 60 minutes, and expert informant interviews last around 60 minutes, up to 90 minutes. The interview will ask about experiences, support needs, digital tool use, and views related to future support design.",
            "Participation is voluntary. You may decline to take part, skip any question, pause, stop, or withdraw according to the study procedure. Audio recording is optional and will only take place with your separate consent. Please let me know which of the following times would work for you: [insert time options].",
            "Best wishes,<br/>Yao Xiao",
        ],
    )
    invitation_page(
        story, s, "简体中文", "问卷邀请 / 社交媒体或群组转发文字",
        [
            "你是在英国生活的东亚移民吗？我们正在邀请第一代东亚移民参加一项帝国理工学院博士研究的第一阶段探索研究。本研究关注关系、归属感、求助经验，以及日常生活中数字工具或 AI 的使用。",
            "你需要做什么：完成一份匿名线上问卷，约 15-20 分钟。问卷会询问你的移民经历、归属感、支持需求、数字工具使用，以及对 AI 支持服务的看法。",
            "提交问卷后，你可以自愿选择参加 5 份 £20 礼券抽奖，和/或留下联系方式以便未来研究联系。参与者信息表将在问卷开始前提供，并在同意参与前供你阅读。参与完全自愿。",
        ],
        "参加条件", eligibility_zh_cn, "问卷链接", "联系人",
        "访谈资格确认与安排邮件文字",
        [
            "亲爱的 [姓名]：",
            "感谢你对本研究感兴趣。根据你的筛选问卷回复，你目前看起来符合参加访谈的条件。请查收随附或链接中的参与者信息表和同意书，并在访谈前至少 24 小时阅读这些材料。",
            "你需要做什么：参加一次访谈，线上或在获批准的私密场所进行。移民参与者访谈约 45 分钟，最长 60 分钟；专家知情人访谈约 60 分钟，最长 90 分钟。访谈会询问你的经历、支持需求、数字工具使用，以及与未来支持设计相关的看法。",
            "参与完全自愿。你可以拒绝参加、跳过任何问题、暂停、停止或按照研究程序退出。录音是可选的，只有在你单独同意后才会进行。请告诉我以下哪些时间适合你：[插入时间选项]。",
            "祝好，<br/>肖遥 / Yao Xiao",
        ],
    )
    invitation_page(
        story, s, "繁體中文", "問卷邀請 / 社交媒體或群組轉發文字",
        [
            "你是在英國生活的東亞移民嗎？我們正在邀請第一代東亞移民參加一項帝國理工學院博士研究的第一階段探索研究。本研究關注關係、歸屬感、求助經驗，以及日常生活中數碼工具或 AI 的使用。",
            "你需要做什麼：完成一份匿名網上問卷，約 15-20 分鐘。問卷會詢問你的移民經驗、歸屬感、支持需求、數碼工具使用，以及對 AI 支持服務的看法。",
            "提交問卷後，你可以自願選擇參加 5 份 £20 禮券抽獎，和/或留下聯絡方式以便未來研究聯絡。參與者資訊表將在問卷開始前提供，並在同意參與前供你閱讀。參與完全自願。",
        ],
        "參加條件", eligibility_zh_tw, "問卷連結", "聯絡人",
        "訪談資格確認與安排郵件文字",
        [
            "親愛的 [姓名]：",
            "感謝你對本研究感興趣。根據你的篩選問卷回覆，你目前看起來符合參加訪談的條件。請查收隨附或連結中的參與者資訊表和同意書，並在訪談前至少 24 小時閱讀這些材料。",
            "你需要做什麼：參加一次訪談，網上或在獲批准的私密場所進行。移民參與者訪談約 45 分鐘，最長 60 分鐘；專家知情人訪談約 60 分鐘，最長 90 分鐘。訪談會詢問你的經驗、支持需求、數碼工具使用，以及與未來支持設計相關的看法。",
            "參與完全自願。你可以拒絕參加、跳過任何問題、暫停、停止或按照研究程序退出。錄音是可選的，只有在你單獨同意後才會進行。請告訴我以下哪些時間適合你：[插入時間選項]。",
            "祝好，<br/>肖遙 / Yao Xiao",
        ],
    )
    invitation_page(
        story, s, "日本語", "アンケート案内 / SNS またはグループ共有用テキスト",
        [
            "英国で暮らす東アジア系移民の方にご協力をお願いしています。これはインペリアル・カレッジ・ロンドンの博士研究における第1フェーズ探索研究で、人間関係、帰属意識、支援の求め方、日常生活でのデジタルツールや AI の利用について調査しています。",
            "参加内容：匿名のオンラインアンケートに回答します。所要時間は約15-20分です。アンケートでは、移民経験、帰属意識、支援ニーズ、デジタルツールの利用、AI支援サービスへの考えを尋ねます。",
            "アンケート提出後、任意で £20 ギフト券5名分の抽選に参加したり、今後の研究連絡のための連絡先を残したりすることができます。参加者情報シートは、同意の前にアンケート冒頭で提示されます。参加は完全に任意です。",
        ],
        "参加条件", eligibility_ja, "アンケートリンク", "連絡先",
        "インタビュー参加条件確認および日程調整用メール文",
        [
            "[氏名] 様",
            "本研究にご関心をお寄せいただき、ありがとうございます。スクリーニング回答に基づき、現時点ではインタビュー参加条件を満たしていると思われます。添付またはリンク先の参加者情報シートと同意書を、インタビューの少なくとも24時間前までにご確認ください。",
            "参加内容：オンラインまたは承認された私的な場所で、1回のインタビューに参加します。移民参加者インタビューは約45分、最長60分、専門家インフォーマント・インタビューは約60分、最長90分です。経験、支援ニーズ、デジタルツールの利用、将来の支援デザインに関する考えを伺います。",
            "参加は任意です。参加を辞退したり、質問を飛ばしたり、一時停止・中止したり、研究手続きに従って撤回したりできます。音声録音は任意であり、別途同意をいただいた場合にのみ行います。以下のうち、ご都合のよい時間をお知らせください：[候補時間を挿入]。",
            "よろしくお願いいたします。<br/>Yao Xiao",
        ],
    )
    invitation_page(
        story, s, "한국어", "설문 초대 / 소셜미디어 또는 그룹 공유 문구",
        [
            "영국에 거주하는 동아시아 출신 이민자분들을 연구에 초대합니다.",
            "본 연구는 임페리얼 칼리지 런던 박사과정 연구의 첫 번째 탐색 단계입니다. 영국에서 생활하며 경험하는 인간관계와 소속감, 도움이 필요할 때 지원을 구하는 방식, 일상에서 디지털 도구와 인공지능(AI)을 사용하는 경험을 알아보고자 합니다.",
            "참여자는 약 15-20분 동안 익명 온라인 설문에 응답하게 됩니다. 설문에서는 이민 경험, 소속감, 필요한 도움과 지원, 디지털 도구 사용 경험, AI 기반 지원 서비스에 대한 생각을 질문합니다.",
            "설문을 완료한 후, 희망하시는 경우 £20 상당의 상품권 추첨에 응모하실 수 있습니다(총 5명 추첨). 또한 후속 연구 안내를 희망하시는 경우 연락처를 남기실 수 있습니다. 추첨 및 후속 연구 연락을 위한 연락처는 설문 응답과 별도로 관리됩니다.",
            "설문을 시작하기 전에 연구의 목적과 참여 내용을 설명한 참여자 설명문을 확인하실 수 있습니다. 연구 참여는 전적으로 자발적 동의에 따릅니다.",
        ],
        "참여 조건", eligibility_ko, "설문 링크", "문의",
        "인터뷰 적격성 확인 및 일정 조율 이메일 문구",
        [
            "[이름] 님께,",
            "본 연구에 관심을 가져 주셔서 감사합니다. 선별 질문 응답을 바탕으로, 현재 인터뷰 참여 조건에 해당하는 것으로 보입니다. 첨부 또는 링크된 참여자 정보문과 동의서를 인터뷰 최소 24시간 전까지 확인해 주세요.",
            "참여 내용: 온라인 또는 승인된 사적인 장소에서 1회의 인터뷰에 참여합니다. 이민자 참여자 인터뷰는 약 45분, 최대 60분이며, 전문가 정보제공자 인터뷰는 약 60분, 최대 90분입니다. 경험, 지원 필요, 디지털 도구 사용, 향후 지원 설계와 관련된 생각을 묻습니다.",
            "참여는 자발적이며, 참여를 거절하거나 질문을 건너뛰거나, 일시 중지, 중단 또는 연구 절차에 따라 철회할 수 있습니다. 음성 녹음은 선택 사항이며 별도 동의가 있는 경우에만 진행됩니다. 아래 시간 중 가능한 시간을 알려 주세요: [시간 옵션 삽입].",
            "감사합니다.<br/>Yao Xiao",
        ],
    )

    # Remove trailing blank page if present.
    if story and isinstance(story[-1], PageBreak):
        story.pop()

    doc.build(story, onFirstPage=draw_page_background, onLaterPages=draw_page_background)


if __name__ == "__main__":
    build()
