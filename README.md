# Stand-bye 🛏️⏰

O **Stand-bye** é uma alternativa Web, moderna e totalmente **Open Source** ao aplicativo *StandBy Mode Pro*. Desenvolvido utilizando a tríade clássica da web (**HTML5, CSS3 e JavaScript puro**), o projeto foi estruturado como um **PWA (Progressive Web App)**, permitindo que você o instale diretamente no seu smartphone e o utilize em tela cheia como um relógio de cabeceira inteligente enquanto ele carrega.

Este projeto foi projetado inicialmente com foco em dispositivos com telas AMOLED (como o Galaxy S24 FE), trazendo algoritmos nativos de proteção contra retenção de imagem.

## ✨ Funcionalidades Principais

- **Visual Clean & Duo Layout:** Exibição elegante do relógio digital e informações do dispositivo lado a lado.
- **Proteção Anti-Burn-In (Pixel Shift):** Algoritmo inteligente que desloca a tela milimetricamente a cada 60 segundos, protegendo painéis OLED/AMOLED de desgaste.
- **Screen Wake Lock API:** Impede que o sistema operacional apague a tela do celular de forma automática enquanto o display de cabeceira estiver ativo.
- **Suporte a PWA:** Instale o site diretamente no seu Android através do navegador Chrome ou Samsung Internet para rodar em modo *standalone* (sem barras de navegação).

## 🛠️ Tecnologias Utilizadas

- HTML5 (Estrutura e semântica)
- CSS3 (Estilização responsiva e filtros de imagem para Modo Noturno)
- JavaScript Puro (Lógica de tempo, APIs do navegador e Service Workers)

## 🚀 Como Executar Localmente

1. Faça o clone deste repositório:
   ```bash
   git clone https://github.com
   ```
2. Abra o arquivo `index.html` em qualquer navegador.

## 🤝 Como Contribuir

Este é um projeto **100% open source**! Sinta-se livre para abrir *Issues* com sugestões, relatar bugs ou enviar *Pull Requests* com novos temas de relógio (como Neon, Matrix, Flip Clock), integração com widgets domésticos e melhorias de código.

## 📄 Licença

Este projeto está sob a licença MIT. Veja o arquivo [LICENSE](LICENSE) para mais detalhes.
