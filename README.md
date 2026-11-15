# Site da Clínica MultiverCidades Acre

Página única (landing page) do Núcleo Acre do Programa + Justiça Socioambiental: Amazônia
Legal, no Observatório de Direitos Humanos da UFAC. É HTML, CSS e JavaScript puros, sem
etapa de build: o GitHub Pages serve os arquivos como estão.

## O que tem em cada arquivo

```
index.html             a página inteira; todo o texto se edita aqui
404.html               página de endereço inexistente
.nojekyll              faz o GitHub Pages servir os arquivos sem processar
assets/css/style.css   aparência (cores e fontes do portfólio da equipe)
assets/js/main.js      menu do celular, perfis da equipe, filtro por área,
                       busca do glossário, galeria ampliada, painel do Censo e animações
assets/js/dados-ibge.js  números do Censo 2022 do Acre e dos 22 municípios (gerado)
assets/fonts/          Cabin e Barlow Condensed, com as licenças (OFL)
assets/img/            logo (logo.svg parada, logo-animado.svg no topo da página), fotos
                       da equipe, bastidores, parceiros, favicons e og.jpg (prévia em redes)
ferramentas/           ibge_dados.py, que atualiza o dados-ibge.js
```

Sem JavaScript a página continua completa: os perfis aparecem embaixo de cada foto, o
glossário abre normalmente e o mapa dos casos aparece sem o painel do Censo.

## Ver no computador

```bash
cd site_clinica
python -m http.server 8000
```

Abra <http://localhost:8000>. Se a porta 8000 estiver ocupada, troque o número nos dois
lugares (por exemplo, `python -m http.server 8765` e <http://localhost:8765>). Abrir o
`index.html` com dois cliques também funciona, mas as curvas de nível decorativas do fundo só
aparecem quando a página é servida por http.

## Publicar no GitHub Pages

1. Crie um repositório no GitHub, de preferência na conta da clínica. Se o repositório se
   chamar `NOME-DA-CONTA.github.io`, o site fica na raiz desse endereço; com qualquer outro
   nome, fica em `NOME-DA-CONTA.github.io/NOME-DO-REPOSITORIO/`.
2. Envie o **conteúdo** desta pasta para a raiz do repositório, incluindo a pasta `assets` e
   o arquivo `.nojekyll`. Pelo navegador: *Add file → Upload files* e arraste tudo. Pelo
   terminal:

   ```bash
   cd site_clinica
   git init -b main
   git add .
   git commit -m "Site da clínica"
   git remote add origin https://github.com/NOME-DA-CONTA/NOME-DO-REPOSITORIO.git
   git push -u origin main
   ```

3. No repositório: *Settings → Pages → Build and deployment*. Em *Source*, escolha
   *Deploy from a branch*; em *Branch*, `main` e a pasta `/ (root)`. Salve.
4. Em um ou dois minutos o endereço aparece no topo da mesma tela.

**Depois de publicar:** no `index.html`, troque `content="assets/img/og.jpg"` pelo endereço
completo da imagem (`https://NOME-DA-CONTA.github.io/NOME-DO-REPOSITORIO/assets/img/og.jpg`).
Instagram, WhatsApp e LinkedIn só mostram a prévia com o endereço completo.

## Como editar

Cada bloco do `index.html` tem um comentário explicando o que mudar.

| Para mudar | Onde |
|---|---|
| Uma pessoa da equipe | `<li class="membro">` na seção `#equipe`. `data-area` define o filtro (`juridica`, `social`, `territorial`, `cartografica`); `data-nivel` define a cor (`coordenacao`, `supervisao`, `residencia`, `apoio`). O texto da janela de perfil fica em `<div class="membro__perfil">`. |
| A foto de alguém | `assets/img/equipe/`, quadrada, 400 × 400 px, em WebP, com o rosto no centro. |
| Uma atividade | Copie um `<li class="evento">` dentro do mês. `evento--marco` destaca marcos; `evento--agora` marca o que está em curso. |
| A etapa de um caso | Na lista `progresso` do caso: `feito` nas etapas concluídas e `atual` na etapa em andamento. |
| Um termo do glossário | Copie um `<details class="termo">`. |
| Contatos | Seção `#contato` e o bloco `application/ld+json` no `<head>`. |
| Rótulos do painel do Censo | `<div class="ibge">` na seção `#casos`. Os números vêm do `dados-ibge.js` (veja abaixo). |
| Data de atualização | Rodapé. |

## Mapa dos casos com os números do Censo

Clicar num município do mapa (ou escolher na lista logo abaixo dele) mostra população, área,
densidade, idade mediana, domicílios, população urbana, alfabetização, água, esgoto, lixo e
cor ou raça, sempre comparados com o Acre. Clicar de novo no mesmo município volta para o
estado inteiro. A lista também serve para quem usa teclado ou leitor de tela e para os
municípios pequenos demais para tocar no celular.

Os números ficam em `assets/js/dados-ibge.js`: o site não consulta o IBGE quando alguém abre a
página. Eles vêm do Censo Demográfico 2022 (SIDRA, tabelas 4714, 4712, 10211, 9515, 9543, 9605,
6803, 6805 e 6892), e os percentuais são calculados a partir das contagens de cada tabela.
Para baixar de novo, com internet:

```bash
cd site_clinica
python ferramentas/ibge_dados.py
```

O script só usa a biblioteca padrão do Python. Antes de gravar, ele confere se vieram os 22
municípios e se a soma das populações bate com o total do Acre. Para mostrar outro percentual
em barra, acrescente a consulta no script e um `<li data-barra="nome-do-campo">` no painel.

## Logo animada

O topo da página usa `assets/img/logo-animado.svg`: o mesmo desenho do `logo.svg`, com as
animações em CSS dentro do próprio arquivo, no bloco `<style>` do começo. As folhas da
seringueira balançam com o vento e o látex escorre pelos cortes do tronco até a tigela. A
balança pende de leve para um lado e para o outro, e as pessoas erguem e abaixam os braços
junto com os pratos. As casas de palafita balançam e acendem as janelas, o rio corre, o sol
gira devagar e a rota do mapa do Acre se desenha ao abrir a página. Para mudar a velocidade ou
a intensidade, edite os tempos e os graus nesse bloco. Na balança, os pratos e as pessoas
precisam ter o mesmo tempo e o mesmo atraso do travessão (`pender`) para continuarem juntos.

Quem configurou o sistema para reduzir movimento recebe o `logo.svg` parado (pelo `<picture>`
no `index.html`). O cabeçalho e o rodapé usam sempre a logo parada, porque nesse tamanho a
animação quase não aparece. Se a logo mudar, a versão animada precisa ser refeita a partir da
nova.

## O que nunca publicar

Estas regras vêm da proposta de redes sociais da equipe e da LGPD, e valem para cada
atualização do site:

- Nenhum dado pessoal de moradores ou das partes: nome, documento, endereço, telefone ou rosto
  identificável.
- Nenhuma coordenada de moradia nem mapa em escala que mostre casas ou colocações. Os mapas do
  site param na escala do município.
- Nenhum número de processo, peça dos autos ou documento sigiloso.
- Nenhuma conclusão sobre caso em curso antes da apresentação à Comissão de Soluções
  Fundiárias.
- Foto de pessoa só com autorização de uso de imagem, que é um documento diferente do termo
  de consentimento da pesquisa. Rostos de crianças e de pessoas com deficiência ficam
  preservados.
- Da equipe, só nome, função e atuação na clínica. Nada de CPF, telefone ou e-mail pessoal,
  endereço, notas de seleção ou valor de bolsa.
- Tom técnico, nunca militante: a clínica assessora a Comissão e não é parte nos casos.

Antes de publicar uma mudança, peça para outra pessoa da equipe conferir esta lista.

## Pendências antes de divulgar

- [ ] Autorização de uso de imagem de cada integrante. As fotos da equipe vieram do
      portfólio *Equipe & Estrutura*; as dos bastidores, das pastas de encontros.
- [ ] Cada pessoa revisar o próprio texto de perfil.
- [ ] Coordenação aprovar o texto da seção de casos.
- [ ] Confirmar o uso das marcas do ODH, da UFAC, do + Justiça Socioambiental, do MJSP e do FDD.

## Créditos

- Logo: identidade visual da clínica (pasta *Comunicação/Identidade Visual*).
- Fontes: [Cabin](https://github.com/impallari/Cabin) e
  [Barlow Condensed](https://github.com/jpt/barlow), SIL Open Font License 1.1 (licenças em
  `assets/fonts/`).
- Mapas: malhas municipal e estadual do IBGE, simplificadas.
- Números dos municípios: IBGE, Censo Demográfico 2022, pela API de agregados
  (<https://servicodados.ibge.gov.br>).
- Logos de parceiros: pertencem às respectivas instituições.
- Ícones, curvas de nível e animação da logo: feitos para este site.

O site não usa cookies, analytics nem serviços externos: fontes, imagens e números do IBGE
ficam no próprio repositório. O GitHub registra o endereço IP dos acessos ao GitHub Pages por segurança,
conforme a política de privacidade do GitHub.
