# -*- coding: utf-8 -*-
"""Atualiza assets/js/dados-ibge.js com os números do Censo Demográfico 2022 do IBGE.

Baixa da API de agregados do IBGE (a mesma base do SIDRA) os indicadores do Acre e dos seus
22 municípios. Os percentuais são calculados a partir das contagens de cada tabela.

Uso, de dentro da pasta do site (precisa de internet; só usa a biblioteca padrão do Python):

    python ferramentas/ibge_dados.py
"""
import datetime
import gzip
import json
import os
import sys
import urllib.parse
import urllib.request

if hasattr(sys.stdout, "reconfigure"):
    sys.stdout.reconfigure(encoding="utf-8")

SAIDA = os.path.join(os.path.dirname(os.path.abspath(__file__)), "..", "assets", "js", "dados-ibge.js")
LOCAIS = "N6[N3[12]]|N3[12]"  # municípios do Acre (N6 dentro da UF 12) e o próprio estado
MESES = ("janeiro", "fevereiro", "março", "abril", "maio", "junho", "julho", "agosto",
         "setembro", "outubro", "novembro", "dezembro")


def baixar(url):
    pedido = urllib.request.Request(url, headers={"User-Agent": "Mozilla/5.0"})
    with urllib.request.urlopen(pedido, timeout=90) as resposta:
        dados = resposta.read()
    if dados[:2] == b"\x1f\x8b":  # a API às vezes responde em gzip sem ter sido pedido
        dados = gzip.decompress(dados)
    return json.loads(dados.decode("utf-8"))


def consulta(tabela, variaveis, classificacao=None):
    """-> {(variável, categorias ou None): {código da localidade: valor}} e os nomes das localidades."""
    q = {"localidades": LOCAIS}
    if classificacao:
        q["classificacao"] = classificacao
    url = (f"https://servicodados.ibge.gov.br/api/v3/agregados/{tabela}/periodos/2022/variaveis/{variaveis}?"
           + urllib.parse.urlencode(q, safe="[]|,"))
    saida, nomes = {}, {}
    for var in baixar(url):
        for res in var["resultados"]:
            cats = [list(c["categoria"].keys())[0] for c in res["classificacoes"]]
            chave = (var["id"], ",".join(cats) if cats else None)
            for s in res["series"]:
                loc = s["localidade"]["id"]
                nomes[loc] = s["localidade"]["nome"].replace(" - AC", "").replace(" (AC)", "")
                try:
                    saida.setdefault(chave, {})[loc] = float(s["serie"].get("2022"))
                except (TypeError, ValueError):
                    saida.setdefault(chave, {})[loc] = None  # "-", "..." ou "X" (sigilo)
    return saida, nomes


# tabela, variáveis e classificação de cada indicador (nomes das categorias nos comentários)
base, nomes = consulta(4714, "93|6318|614")                              # população, área, densidade
dom, _ = consulta(4712, "381|5930")                                      # domicílios, média de moradores
sit, _ = consulta(10211, "93", "1[6795,1]|2661[32776]")                  # situação: total, urbana
idade, _ = consulta(9515, "10613")                                       # idade mediana
alfa, _ = consulta(9543, "2513", "2[6794]|86[95251]|287[100362]")        # alfabetização, 15 anos ou mais
cor, _ = consulta(9605, "93", "86[95251,2776,2777,2778,2779,2780]")      # cor ou raça
agua, _ = consulta(6803, "381", "1821[72129,72144]")                     # total, ligado à rede geral e usa
esgoto, _ = consulta(6805, "381", "11558[46292,46290]")                  # total, rede geral, pluvial ou fossa ligada à rede
lixo, _ = consulta(6892, "381", "67[10972,2520]")                        # total, coletado


def valor(d, chave, loc):
    return d.get(chave, {}).get(loc)


def pct(d, parte, total, loc):
    p, t = valor(d, parte, loc), valor(d, total, loc)
    return round(100 * p / t, 1) if p is not None and t else None


registros = {}
for loc, nome in nomes.items():
    registros[loc] = {
        "nome": nome,
        "populacao": valor(base, ("93", None), loc),
        "area": valor(base, ("6318", None), loc),
        "densidade": valor(base, ("614", None), loc),
        "domicilios": valor(dom, ("381", None), loc),
        "moradores": valor(dom, ("5930", None), loc),
        "urbana": pct(sit, ("93", "1,32776"), ("93", "6795,32776"), loc),
        "idadeMediana": valor(idade, ("10613", None), loc),
        "alfabetizacao": valor(alfa, ("2513", "6794,95251,100362"), loc),
        "cor": {nome_cor: pct(cor, ("93", c), ("93", "95251"), loc)
                for nome_cor, c in (("parda", "2779"), ("branca", "2776"), ("preta", "2777"),
                                    ("indigena", "2780"), ("amarela", "2778"))},
        "agua": pct(agua, ("381", "72144"), ("381", "72129"), loc),
        "esgoto": pct(esgoto, ("381", "46290"), ("381", "46292"), loc),
        "lixo": pct(lixo, ("381", "2520"), ("381", "10972"), loc),
    }

# conferências antes de gravar
acre = registros["12"]
municipios = {cod: r for cod, r in registros.items() if cod != "12"}
assert len(municipios) == 22, f"esperava 22 municípios, vieram {len(municipios)}"
soma = sum(m["populacao"] for m in municipios.values())
assert soma == acre["populacao"], f"a soma dos municípios ({soma}) difere do Acre ({acre['populacao']})"
for r in registros.values():
    total_cor = sum(v for v in r["cor"].values() if v is not None)
    assert 99 <= total_cor <= 101, f"{r['nome']}: cor ou raça soma {total_cor}%"
sem_valor = [(r["nome"], campo) for r in registros.values() for campo, v in r.items() if v is None]
if sem_valor:
    print("aviso, campos sem valor (o site mostra um travessão):", sem_valor)

hoje = datetime.date.today()
dados = {
    "fonte": "IBGE, Censo Demográfico 2022 (SIDRA: tabelas 4714, 4712, 10211, 9515, 9543, 9605, 6803, 6805 e 6892).",
    "acre": acre,
    "municipios": dict(sorted(municipios.items(), key=lambda kv: kv[1]["nome"])),
}
js = ("/* Indicadores do Censo Demográfico 2022 (IBGE) por município do Acre.\n"
      f"   Gerado por ferramentas/ibge_dados.py a partir da API de agregados do IBGE (servicodados.ibge.gov.br)"
      f" em {MESES[hoje.month - 1]} de {hoje.year}.\n"
      "   Percentuais calculados sobre o total de cada tabela. Chave = código IBGE do município. */\n"
      "window.DADOS_IBGE = " + json.dumps(dados, ensure_ascii=False, separators=(",", ":")) + ";\n")
with open(SAIDA, "w", encoding="utf-8", newline="\n") as arquivo:
    arquivo.write(js)
print(f"gravado {os.path.normpath(SAIDA)} ({len(js.encode('utf-8'))} bytes); "
      f"população do Acre {acre['populacao']:,.0f} = soma dos 22 municípios".replace(",", "."))
