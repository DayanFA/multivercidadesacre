/* Clínica MultiverCidades Acre — interações da página.
   Tudo aqui é melhoria progressiva: sem JavaScript o conteúdo continua completo. */
(() => {
  'use strict';
  window.__siteOk = true; // avisa o <head> de que o script carregou (ver index.html)

  const reduzirMovimento = window.matchMedia('(prefers-reduced-motion: reduce)').matches;
  const temIO = 'IntersectionObserver' in window;
  const $ = (sel, raiz = document) => raiz.querySelector(sel);
  const $$ = (sel, raiz = document) => [...raiz.querySelectorAll(sel)];

  /* ------------------------------------------------ cabeçalho e "voltar ao topo" */
  const topo = $('.topo');
  const voltar = $('.voltar-topo');
  const aoRolar = () => {
    const y = window.scrollY;
    topo?.classList.toggle('rolou', y > 8);
    voltar?.classList.toggle('visivel', y > 900);
  };
  window.addEventListener('scroll', aoRolar, { passive: true });
  aoRolar();

  /* ------------------------------------------------ menu no celular */
  const botaoMenu = $('.menu-botao');
  const menu = $('#menu');
  const fecharMenu = () => {
    menu?.classList.remove('aberto');
    botaoMenu?.setAttribute('aria-expanded', 'false');
  };
  botaoMenu?.addEventListener('click', () => {
    const aberto = menu.classList.toggle('aberto');
    botaoMenu.setAttribute('aria-expanded', String(aberto));
  });
  menu?.addEventListener('click', (e) => { if (e.target.closest('a')) fecharMenu(); });
  document.addEventListener('click', (e) => {
    if (menu?.classList.contains('aberto') && !e.target.closest('.topo')) fecharMenu();
  });
  document.addEventListener('keydown', (e) => {
    if (e.key === 'Escape' && menu?.classList.contains('aberto')) { fecharMenu(); botaoMenu.focus(); }
  });

  /* ------------------------------------------------ item do menu da seção visível */
  const linksMenu = $$('.menu a[href^="#"]');
  if (temIO) {
    const marcar = (id) => linksMenu.forEach((a) => {
      if (a.getAttribute('href') === `#${id}`) a.setAttribute('aria-current', 'true');
      else a.removeAttribute('aria-current');
    });
    const obsSecoes = new IntersectionObserver((entradas) => {
      entradas.forEach((en) => { if (en.isIntersecting) marcar(en.target.id); });
    }, { rootMargin: '-45% 0px -50% 0px' });
    $$('main > section[id]').forEach((s) => obsSecoes.observe(s));
  }

  /* ------------------------------------------------ entrada suave ao rolar */
  const revelaveis = $$('[data-revelar]');
  revelaveis.forEach((el) => {
    const irmaos = [...el.parentElement.children].filter((c) => c.hasAttribute('data-revelar'));
    const i = irmaos.indexOf(el);
    if (i > 0) el.style.setProperty('--atraso', `${Math.min(i, 6) * 0.08}s`);
  });
  if (!temIO || reduzirMovimento) {
    revelaveis.forEach((el) => el.classList.add('visivel'));
  } else {
    const obsRevelar = new IntersectionObserver((entradas) => {
      entradas.forEach((en) => {
        if (en.isIntersecting) { en.target.classList.add('visivel'); obsRevelar.unobserve(en.target); }
      });
    }, { rootMargin: '0px 0px -6% 0px', threshold: 0.06 });
    revelaveis.forEach((el) => obsRevelar.observe(el));
  }

  /* ------------------------------------------------ números do topo */
  if (temIO && !reduzirMovimento) {
    const animar = (el) => {
      const fim = Number(el.dataset.contar);
      const inicio = performance.now();
      const passo = (agora) => {
        const p = Math.min(1, (agora - inicio) / 1300);
        el.textContent = String(Math.round(fim * (1 - (1 - p) ** 3)));
        if (p < 1) requestAnimationFrame(passo);
      };
      requestAnimationFrame(passo);
    };
    const obsNumeros = new IntersectionObserver((entradas) => {
      entradas.forEach((en) => {
        if (en.isIntersecting) { animar(en.target); obsNumeros.unobserve(en.target); }
      });
    }, { threshold: 0.6 });
    $$('[data-contar]').forEach((el) => { el.textContent = '0'; obsNumeros.observe(el); });
  }

  /* ------------------------------------------------ equipe: destaque por área */
  const organograma = $('.organograma');
  const membros = $$('.membro');
  const filtro = $('.filtro');
  const statusFiltro = $('.filtro__status');
  if (filtro && organograma) {
    filtro.hidden = false;
    filtro.addEventListener('click', (e) => {
      const botao = e.target.closest('.filtro__botao');
      if (!botao) return;
      const area = botao.dataset.filtro;
      $$('.filtro__botao', filtro).forEach((b) => b.setAttribute('aria-pressed', String(b === botao)));
      organograma.dataset.filtro = area;
      if (area === 'todas') {
        statusFiltro.textContent = 'Mostrando toda a equipe.';
      } else {
        const n = membros.filter((m) => m.dataset.area.split(' ').includes(area)).length;
        statusFiltro.textContent = `${n} integrantes em destaque na área ${botao.textContent.trim()}.`;
      }
    });
  }

  /* ------------------------------------------------ equipe: janela de perfil */
  const dialogo = $('#perfil');
  let atual = 0;
  let origem = null;
  const preencher = (i) => {
    atual = (i + membros.length) % membros.length;
    const m = membros[atual];
    const nome = $('.membro__nome', m).textContent.trim();
    const img = $('.membro__foto img', m);
    const estilo = getComputedStyle(m);
    dialogo.style.setProperty('--t', estilo.getPropertyValue('--t').trim());
    dialogo.style.setProperty('--tt', estilo.getPropertyValue('--tt').trim());
    $('#perfil-nome', dialogo).textContent = nome;
    $('.perfil__cargo', dialogo).textContent = $('.membro__cargo', m).textContent.trim();
    const foto = $('.perfil__foto', dialogo);
    foto.src = img.currentSrc || img.src;
    foto.alt = `Foto de ${nome}`;
    $('.perfil__corpo', dialogo).innerHTML = $('.membro__perfil', m).innerHTML; // conteúdo da própria página
    $('.perfil__contagem', dialogo).textContent = `${atual + 1} de ${membros.length}`;
  };
  if (dialogo && typeof dialogo.showModal === 'function') {
    membros.forEach((m, i) => {
      $('.membro__botao', m).addEventListener('click', (e) => {
        origem = e.currentTarget;
        preencher(i);
        dialogo.showModal();
      });
    });
    dialogo.addEventListener('click', (e) => {
      if (e.target === dialogo || e.target.closest('.perfil__fechar')) { dialogo.close(); return; }
      const ir = e.target.closest('[data-ir]');
      if (ir) preencher(atual + Number(ir.dataset.ir));
    });
    dialogo.addEventListener('keydown', (e) => {
      if (e.key === 'ArrowRight') preencher(atual + 1);
      if (e.key === 'ArrowLeft') preencher(atual - 1);
    });
    dialogo.addEventListener('close', () => origem?.focus());
  } else {
    // navegador sem <dialog>: os perfis ficam visíveis embaixo de cada cartão
    document.documentElement.classList.add('sem-dialogo');
  }

  /* ------------------------------------------------ glossário: busca */
  const busca = $('.busca');
  const campoBusca = $('#busca-termo');
  const termos = $$('.termo');
  const vazio = $('.glossario__vazio');
  const statusBusca = $('.busca__status');
  const normalizar = (s) => s.normalize('NFD').replace(/[\u0300-\u036f]/g, '').toLowerCase();
  if (busca && campoBusca) {
    busca.hidden = false;
    const indice = termos.map((t) => normalizar(t.textContent));
    campoBusca.addEventListener('input', () => {
      const q = normalizar(campoBusca.value.trim());
      let achados = 0;
      termos.forEach((t, i) => {
        const ok = !q || indice[i].includes(q);
        t.hidden = !ok;
        if (ok) achados += 1;
        if (q && ok && normalizar($('summary', t).textContent).includes(q)) t.open = true;
      });
      vazio.hidden = achados > 0;
      statusBusca.textContent = q && achados
        ? `${achados} ${achados === 1 ? 'termo encontrado' : 'termos encontrados'}.`
        : '';
    });
  }

  /* ------------------------------------------------ casos: mapa e cartões juntos */
  const figuraMapa = $('.casos__mapa');
  if (figuraMapa) {
    const ativar = (caso) => {
      figuraMapa.dataset.ativo = caso;
      $$('.caso').forEach((c) => c.classList.toggle('ativo', c.dataset.caso === caso));
    };
    const desativar = () => {
      delete figuraMapa.dataset.ativo;
      $$('.caso.ativo').forEach((c) => c.classList.remove('ativo'));
    };
    $$('[data-caso]').forEach((el) => {
      el.addEventListener('mouseenter', () => ativar(el.dataset.caso));
      el.addEventListener('mouseleave', desativar);
      el.addEventListener('focusin', () => ativar(el.dataset.caso));
      el.addEventListener('focusout', desativar);
    });
  }

  /* ------------------------------------------------ casos: números do Censo 2022 por município
     Os dados vêm de assets/js/dados-ibge.js. Clicar no mapa ou escolher na lista troca o
     município; clicar de novo no mesmo município volta para o Acre inteiro. A lista é o caminho
     pelo teclado e também serve para os municípios pequenos demais para tocar no celular. */
  const painel = $('.ibge');
  const dados = window.DADOS_IBGE;
  const mapaAcre = $('.mapa-acre');
  if (figuraMapa && painel && mapaAcre && dados?.acre && dados.municipios) {
    const seletor = $('#ibge-local', painel);
    const statusIbge = $('.ibge__status', painel);
    const etiqueta = $('.ibge__caso', painel);
    const caminhos = $$('.mun[data-cod]', mapaAcre);
    const acre = dados.acre;
    const formato = (casas) => new Intl.NumberFormat('pt-BR', { minimumFractionDigits: casas, maximumFractionDigits: casas });
    const f0 = formato(0);
    const f1 = formato(1);
    const f2 = formato(2);
    const temValor = (v) => typeof v === 'number' && Number.isFinite(v);
    const num = (v, f) => (temValor(v) ? f.format(v) : '—');
    const pct = (v) => (temValor(v) ? `${f1.format(v)}%` : '—');
    const largura = (v) => `${temValor(v) ? Math.max(0, Math.min(100, v)) : 0}%`;
    const criar = (tag, classe = '', texto = '') => {
      const el = document.createElement(tag);
      if (classe) el.className = classe;
      if (texto) el.textContent = texto;
      return el;
    };

    // municípios na lista, em ordem alfabética
    Object.entries(dados.municipios)
      .sort(([, a], [, b]) => a.nome.localeCompare(b.nome, 'pt-BR'))
      .forEach(([cod, m]) => seletor.add(new Option(m.nome, cod)));

    // barras: o rótulo vem do HTML; o traço marca o valor do Acre (para leitor de tela, em texto)
    const barras = $$('[data-barra]', painel).map((li) => {
      const valor = criar('strong', 'ibge__valor');
      const trilho = criar('span', 'ibge__trilho');
      const nivel = criar('span', 'ibge__nivel');
      const ref = criar('span', 'ibge__ref');
      const noAcre = criar('span', 'visualmente-oculto');
      trilho.setAttribute('aria-hidden', 'true');
      trilho.append(nivel, ref);
      ref.style.setProperty('--v', largura(acre[li.dataset.barra]));
      li.replaceChildren(criar('span', 'ibge__rotulo', li.textContent.trim()), trilho, valor, noAcre);
      return { campo: li.dataset.barra, valor, nivel, noAcre };
    });

    // cor ou raça: barra empilhada só visual; os números ficam na legenda
    const listaCor = $('.ibge__legenda', painel);
    const pilha = criar('div', 'ibge__pilha');
    pilha.setAttribute('aria-hidden', 'true');
    const cores = $$('[data-cor]', listaCor).map((li) => {
      const valor = criar('strong');
      const fatia = criar('span');
      fatia.dataset.cor = li.dataset.cor;
      pilha.append(fatia);
      li.append(' ', valor);
      return { cor: li.dataset.cor, valor, fatia };
    });
    listaCor.before(pilha);

    // os municípios dos casos ganham uma etiqueta com o nome do caso
    const casoDoMunicipio = {};
    caminhos.forEach((p) => {
      const cartao = p.dataset.caso && $(`.caso[data-caso="${p.dataset.caso}"]`);
      if (!cartao) return;
      casoDoMunicipio[p.dataset.cod] = {
        nome: $('h3', cartao).textContent.trim(),
        tipo: cartao.classList.contains('caso--cidade') ? 'cidade' : 'floresta',
      };
    });

    const campos = Object.fromEntries($$('[data-campo]', painel).map((el) => [el.dataset.campo, el]));
    const totalMunicipios = Object.keys(dados.municipios).length;
    let selecionado = null;

    const mostrar = (cod, anunciar = true) => {
      const m = dados.municipios[cod];
      const d = m || acre;
      painel.classList.toggle('ibge--estado', !m);
      campos.nome.textContent = d.nome;
      campos.parte.textContent = m
        ? `${pct((100 * d.populacao) / acre.populacao)} da população do Acre`
        : `${totalMunicipios} municípios`;
      campos.populacao.textContent = num(d.populacao, f0);
      campos.area.textContent = num(d.area, f0);
      campos.densidade.textContent = num(d.densidade, f1);
      campos.idadeMediana.textContent = num(d.idadeMediana, f0);
      campos.domicilios.textContent = num(d.domicilios, f0);
      campos.moradores.textContent = num(d.moradores, f2);
      barras.forEach((b) => {
        b.valor.textContent = pct(d[b.campo]);
        b.nivel.style.setProperty('--v', largura(d[b.campo]));
        b.noAcre.textContent = m ? ` (Acre: ${pct(acre[b.campo])})` : '';
      });
      cores.forEach((c) => {
        const v = d.cor?.[c.cor];
        c.valor.textContent = pct(v);
        c.fatia.style.setProperty('--v', largura(v));
      });
      const caso = m && casoDoMunicipio[cod];
      etiqueta.hidden = !caso;
      if (caso) {
        etiqueta.className = `ibge__caso etiqueta etiqueta--${caso.tipo}`;
        etiqueta.textContent = `Caso ${caso.nome}`;
      }
      caminhos.forEach((p) => {
        const este = p.dataset.cod === cod;
        p.classList.toggle('selecionado', este);
        if (este) p.parentNode.append(p); // traz o contorno para cima dos vizinhos
      });
      selecionado = m ? cod : null;
      seletor.value = m ? cod : 'acre';
      if (anunciar) statusIbge.textContent = `Mostrando os números de ${m ? d.nome : 'todo o Acre'}.`;
    };

    mapaAcre.addEventListener('click', (e) => {
      const p = e.target.closest('.mun[data-cod]');
      if (p) mostrar(p.dataset.cod === selecionado ? 'acre' : p.dataset.cod);
    });
    seletor.addEventListener('change', () => mostrar(seletor.value));
    mostrar('acre', false);
    figuraMapa.classList.add('com-ibge');
    painel.hidden = false;
  }

  /* ------------------------------------------------ galeria: foto ampliada */
  const ampliar = $('#ampliar');
  let origemFoto = null;
  if (ampliar && typeof ampliar.showModal === 'function') {
    $$('.galeria a').forEach((a) => {
      a.addEventListener('click', (e) => {
        e.preventDefault();
        const miniatura = $('img', a);
        const img = $('img', ampliar);
        img.src = a.href;
        img.alt = miniatura.alt;
        $('figcaption', ampliar).textContent = $('figcaption', a.closest('figure')).textContent;
        origemFoto = a;
        ampliar.showModal();
      });
    });
    ampliar.addEventListener('click', (e) => {
      if (e.target === ampliar || e.target.closest('.perfil__fechar')) ampliar.close();
    });
    ampliar.addEventListener('close', () => origemFoto?.focus());
  }
})();
