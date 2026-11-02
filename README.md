# RiverMath

**Matemática por trás de cada mão.**

RiverMath é uma calculadora e simulador open-source para estudar probabilidades, equidade, combinações e pot odds no Texas Hold'em. A aplicação é gratuita, estática e roda os cálculos no navegador.

## Funcionalidades

- Seletor visual de cartas com as 52 cartas do baralho e prevenção de duplicatas.
- Fluxo pré-flop, flop, turn e river.
- Avaliador da melhor mão de cinco cartas entre até sete cartas.
- Monte Carlo com modos Rápido (2.500), Padrão (10.000) e Preciso (50.000).
- Vitória exclusiva, empate, derrota, equidade, distribuição da sua mão e categorias que venceram você.
- Pot odds com comparação educativa contra a equidade estimada.
- Mãos de exemplo, ranking, regras e conceitos matemáticos.
- Dark mode, layout responsivo e suporte a teclado nos controles principais.

## Tecnologias

- Angular 22 standalone + TypeScript strict.
- Angular Signals e Web Worker para as simulações.
- Tailwind CSS v4.
- Zard UI como design system, instalado pelo CLI/MCP oficial.
- Lucide via `@ng-icons/lucide`.
- Vitest via builder de testes do Angular.

## Requisitos

- Node.js 22 LTS ou superior compatível com Angular 22.
- npm.

## Desenvolvimento local

```bash
npm ci
npm start
```

Abra `http://localhost:4200/`.

## Testes

```bash
npm test -- --watch=false
```

Os testes cobrem o baralho, remoção de cartas, avaliação das dez categorias, kickers, ás baixo, melhores cinco cartas, empates, equidade proporcional, distribuição normalizada, aleatoriedade injetável e pot odds.

## Build

```bash
npm run build
```

Os arquivos são gerados em `dist/rivermath/browser`.

## Deploy no GitHub Pages

O workflow `.github/workflows/deploy.yml` executa testes, compila com `base-href` `/rivermath/`, cria o fallback `404.html` para navegação estática e publica com as Actions oficiais do GitHub Pages.

No repositório do GitHub:

1. Abra **Settings → Pages**.
2. Em **Build and deployment**, selecione **GitHub Actions**.
3. Faça push na branch `main` ou execute o workflow manualmente.

O endereço esperado é `https://USUARIO.github.io/rivermath/`. Se o repositório usar outro nome, atualize o `base-href` do workflow. Para domínio personalizado, configure o domínio no GitHub Pages e remova o caminho de projeto do `base-href`.

## Arquitetura

```text
src/app/
  core/poker/
    deck/          baralho, criação, remoção e embaralhamento
    evaluator/     avaliação e comparação de mãos
    probability/   insights de outs e completamento
    pot-odds/      cálculo independente de pot odds
    simulation/    motor Monte Carlo
    workers/       entrada do Web Worker
  features/calculator/
    components/    PlayingCard e seletor visual
    state/         estado Signals e ciclo de vida do worker
  shared/components/ componentes instalados do Zard UI
```

O motor matemático não depende de Angular ou de componentes visuais. O simulador remove as cartas conhecidas, distribui cartas sem reposição, avalia a melhor mão de cada jogador e divide a contribuição de equidade em empates. Royal flush é uma categoria visual separada do straight flush e não é contado duas vezes.

## Limitações

Monte Carlo produz estimativas; aumentar o número de iterações reduz a variação, mas não cria uma garantia. As mãos adversárias são tratadas como desconhecidas e igualmente distribuídas. O modelo não considera ranges reais, posição, rake, implied odds, apostas futuras ou decisões estratégicas.

Outs indicam cartas que melhoram uma combinação, não cartas que necessariamente vencem. Pot odds é uma comparação matemática simplificada e não é uma recomendação automática de call.

## Contribuindo

1. Crie uma branch para a mudança.
2. Mantenha o motor de poker independente da UI.
3. Adicione testes para regras matemáticas novas.
4. Execute `npm test -- --watch=false` e `npm run build`.
5. Abra um pull request descrevendo a hipótese matemática e o impacto visual.

## Licença

MIT. Veja [LICENSE](./LICENSE).
