
# Guia de Configuração de Opções de Produto

Este sistema permite adicionar opções complexas como tamanhos, bordas, e adicionais aos produtos via JSON.

## Como Configurar

1. Acesse o Painel Admin (`/admin/[slug]`).
2. Edite um produto.
3. No campo "Opções (JSON Avançado)", insira a estrutura desejada.

## Estrutura do JSON

O campo aceita uma **lista** de objetos de opção.

### Exemplos

#### 1. Múltiplos Tamanhos (Escolha Única, Obrigatório)
O usuário deve escolher exatamente um.

```json
[
  {
    "name": "Tamanho",
    "type": "single",
    "required": true,
    "values": [
      { "name": "Pequeno", "price": 0 },
      { "name": "Médio", "price": 5 },
      { "name": "Grande", "price": 10 }
    ]
  }
]
```

#### 2. Adicionais (Escolha Múltipla)
O usuário pode escolher vários itens. Pode ter limite máximo.

```json
[
  {
    "name": "Adicionais",
    "type": "multiple",
    "required": false,
    "max": 3,
    "values": [
      { "name": "Bacon Extra", "price": 4.50 },
      { "name": "Queijo Dobro", "price": 3.00 },
      { "name": "Ovo", "price": 2.00 }
    ]
  }
]
```

#### 3. Combinação Completa (Pizza)

```json
[
  {
    "name": "Tamanho",
    "type": "single",
    "required": true,
    "values": [
      { "name": "Média (6 Fatias)", "price": 0 },
      { "name": "Grande (8 Fatias)", "price": 15 }
    ]
  },
  {
    "name": "Borda",
    "type": "single",
    "required": true,
    "values": [
      { "name": "Tradicional", "price": 0 },
      { "name": "Catupiry", "price": 8 },
      { "name": "Cheddar", "price": 8 }
    ]
  }
]
```

### Campos Disponíveis

- `name` (string): Nome do grupo de opções (ex: "Tamanho").
- `type` (string): `"single"` (rádio, apenas um) ou `"multiple"` (checkbox, vários).
- `required` (boolean): Se `true`, o usuário não consegue adicionar ao carrinho sem selecionar.
- `min` (number): Mínimo de opções a selecionar (para `multiple`).
- `max` (number): Máximo de opções a selecionar (para `multiple`).
- `values` (array): Lista de valores selecionáveis.
  - `name`: Nome da opção.
  - `price`: Preço que será **somado** ao preço base do produto.

## Funcionamento no Carrinho

- Produtos com opções diferentes são tratados como itens diferentes no carrinho.
- Observações são salvas individualmente por item.
- O preço total é calculado: `(Preço Base + Soma das Opções) * Quantidade`.
- No Checkout, as opções aparecem detalhadas abaixo do nome do produto.
- No WhatsApp, as opções aparecem com marcadores (`•` para único, `+` para múltiplos).
