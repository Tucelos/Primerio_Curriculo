# 🚀 Meu Primeiro Currículo - Plataforma Web 100% Client-Side

Um sistema moderno, interativo e extremamente acolhedor focado em ajudar jovens a criarem seu primeiro currículo profissional de forma simples, rápida e gratuita. 

Projetado especificamente para **CUSTO ZERO DE HOSPEDAGEM**, o sistema roda inteiramente no navegador do usuário (100% Client-Side), garantindo total privacidade, conformidade com a LGPD e portabilidade.

---

## ✨ Recursos Principais e Diferenciais de UX/UI

- **Assistente Passo a Passo (Multi-step Form):** Divide o preenchimento de dados em 5 etapas intuitivas, evitando sobrecarregar o usuário e garantindo altas taxas de conclusão.
- **Visualização em Tempo Real (Live Preview):** 
  - **Desktop:** Layout dual reativo. Conforme o usuário preenche o formulário à esquerda, o currículo profissional se constrói à direita em tempo real (efeito "Uau").
  - **Mobile-First:** Botão flutuante inteligente que permite alternar instantaneamente entre a edição dos dados e o preview em tela cheia.
- **Dicas de Redação Integradas (Dicas de Recrutadores):** Sugestões de escrita e banners explicativos em cada seção ajudam o jovem a preencher seu Objetivo Profissional e a valorizar experiências informais (como bicos, voluntariados, grêmio estudantil, projetos escolares e ajuda em negócios familiares).
- **Foto de Perfil Inteligente:** Upload local de imagem convertido em Base64 com opção de ligar/desligar ("Exibir/Ocultar foto") a qualquer momento, atendendo a recomendações modernas de diversidade e processos seletivos às cegas.
- **Seletor de Habilidades Rápido:** Tags clicáveis de competências recomendadas por RHs para preenchimento ágil, além de campo para inserção livre de habilidades customizadas.
- **Persistência Segura (Autosave):** O progresso é salvo no `localStorage` do navegador a cada tecla digitada. Se o usuário fechar a aba sem querer ou atualizar a página, nenhum dado será perdido.
- **Geração de PDF Perfeita (html2pdf.js):** Exportação direta para o formato A4 físico nas dimensões padrão do mercado (210mm x 297mm), com textos nítidos (vetoriais), margens impecáveis (12mm) e suporte robusto para múltiplas páginas.

---

## 🔒 Privacidade e LGPD

- **Segurança Máxima:** Não há backend, APIs de terceiros ou bancos de dados intermediários. **Todos** os dados são processados e permanecem única e exclusivamente no aparelho do usuário (computador ou celular).
- **Opção de Limpeza:** Um botão evidente permite "Limpar Dados", removendo todas as chaves do `localStorage` e redefinindo a aplicação instantaneamente.

---

## 🛠️ Tecnologias Utilizadas

- **HTML5:** Estrutura semântica otimizada para SEO e acessibilidade.
- **CSS3 Vanilla Avançado:** Design system implementado com variáveis CSS nativas, transições fluidas e responsividade avançada (Grid/Flexbox).
- **JavaScript Moderno (ES6+):** Sincronização reativa manual rápida e leve, sem necessidade de carregar frameworks pesados como React ou Vue, reduzindo o tempo de carregamento no celular.
- **html2pdf.js:** Conversão client-side perfeita de elementos do DOM em PDF de alta qualidade e com alinhamento rigoroso.

---

## 📁 Estrutura de Arquivos

```
/Curriculo
│
├── index.html        # Estrutura HTML da SPA (Assistente + Preview)
├── style.css         # Variáveis de Design, Animações e Estilos do Currículo
├── app.js            # Lógica reativa, controle de formulário, persistência e PDF
└── README.md         # Este guia com instruções e deploy
```

---

## 🚀 Como Hospedar de Graça (Custo Zero de Hospedagem)

Como a aplicação é 100% estática (HTML/CSS/JS), o custo de infraestrutura é nulo. Abaixo, veja as 3 formas mais fáceis de hospedar o projeto gratuitamente:

### Opção 1: GitHub Pages (Recomendado para Projetos Sociais)
1. Crie um repositório no seu GitHub (ex: `primeiro-curriculo`).
2. Suba estes arquivos (`index.html`, `style.css`, `app.js`) para a branch principal (`main`).
3. Vá nas configurações do repositório em **Settings > Pages**.
4. Em *Build and deployment*, selecione a branch `main` e a pasta `/ (root)`.
5. Clique em **Save**. Em menos de 2 minutos, sua página estará no ar no endereço `https://seu-usuario.github.io/primeiro-curriculo/`.

### Opção 2: Vercel (Hospedagem em 1 Clique)
1. Se você tiver a CLI da Vercel instalada, basta rodar `vercel` na pasta do projeto.
2. Ou conecte sua conta do GitHub à Vercel, selecione o repositório e clique em **Deploy**.
3. A Vercel detectará automaticamente que é um site estático e gerará um link seguro `https://seu-projeto.vercel.app/` gratuito para sempre.

### Opção 3: Netlify
1. Faça login na [Netlify](https://www.netlify.com/).
2. Arraste a pasta do seu projeto diretamente para a área de upload do painel da Netlify.
3. Pronto! O site estará online imediatamente com um subdomínio `.netlify.app` gratuito.

---

## 💡 Como testar localmente

Basta dar dois cliques no arquivo `index.html` em qualquer computador. A aplicação abrirá imediatamente no seu navegador padrão e estará totalmente funcional! Não é necessário ter Node.js, servidores locais ou ferramentas de build instaladas.
