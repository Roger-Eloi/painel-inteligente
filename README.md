# Painel Inteligente Lovable 

Painel Inteligente desenvolvido com **Lovable** e integração ao **n8n**, focado na análise avançada de dados e automação para equipes de marketing, produto e negócios.  
[🔗 Acessar o painel](https://painel-inteligente.lovable.app/?utm_source=lovable-editor)



## 🎯 Resumo

O projeto oferece um painel dinâmico para visualização, processamento automatizado e análise de dados de aplicativos, centralizando informações essenciais através de agentes inteligentes integrados via n8n. Permite avaliação de performance, engajamento, satisfação e aquisição de usuários em linguagem natural com análise por categoria.

---

## 💡 O que faz e quais problemas resolve

- Centraliza dashboards e relatórios inteligentes para apps.
- Automatiza o encaminhamento de dados para agentes especializados de Análise, Ativação, Engajamento, Satisfação e Keywords.
- Gera métricas e insights acionáveis para tomada de decisão por áreas de produto, marketing e negócios.
- 

---

## 📦 Requisitos e Dependências

- Conta n8n (servidor cloud) para receber as requisições
- Permissões de autenticação básicas configuradas para o Webhook (lovable -> n8n)

---

## ⚡ Configuração no n8n

### 1. Configure o Webhooks
  - 1.1 configure o path do webhook para `projeto-1-lovable-painel-inteligente` no n8n para receber dados do painel Lovable.
  
  - 1.2 Crie uma credencial básica com
      - username: "produto.rankmyapp.com.br"
      - password: "Mudar123"
### 2. Configure o Modelo OpenIA
  - Criar uma credencial da api e inserir sua chave `API KEY`  
---

## Decisões técnicas tomadas

- Optei por utilizar a orquestração de tool agents para maior organização do fluxo de agentes
- Transformei os dados json em string para que o lovable enviasse ao n8n, para tratar esses dados

---

## Desafios encontrados e como foram resolvidos

- Tive dificuldade em tratar os dados brutos vindo do lovable, mas encontrei uma solução que foi reduzir a quantidade de palavras repetidas como por exemplo: "maxInstals", "createdAt", etc. assim reduzindo a quantidade de informações desnecessárias que serão enviadas ao prompt do agente que fará a analise desses dados.

---

## 🚀 Melhorias futuras
- Trasformar os dados json recebidos e inseri-los em um banco de dados relacional para os agentes conseguirem ler e interpretar os dados com maior rapidez.
- Criar uma chave única por dia para cada cliente, na qual registrará os dados json em um banco de dados relacional com esse id da chave e para futuras consultas nos dados não necessitar que envie todos os arquivos json novamente, com duração de expiração de 2h ou a cada novos arquivos sendo identificados no painel, assim deletando os dados anteriores do banco e registrando novos dados para os agentes passarem a utilizar nas análises.
- Exportação completa de todo o painel para PDF
- Cards abaixo dos gráficos com informações de insights gerados pela IA automaticamente
---
