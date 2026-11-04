// Biblioteca do seletor de ícones (MaterialCommunityIcons). "kw" são palavras-chave em português para a busca.
export type IconGroup = { title: string; icons: { name: string; kw: string }[] };
export const ICON_GROUPS: IconGroup[] = [
  {
    "title": "Rotina",
    "icons": [
      {
        "name": "bed-outline",
        "kw": "cama dormir sono acordar"
      },
      {
        "name": "alarm",
        "kw": "despertador acordar"
      },
      {
        "name": "clock-outline",
        "kw": "relogio hora tempo"
      },
      {
        "name": "calendar-check-outline",
        "kw": "calendario agenda data"
      },
      {
        "name": "checkbox-marked-circle-outline",
        "kw": "tarefa feito concluir"
      },
      {
        "name": "bell-outline",
        "kw": "lembrete aviso notificacao"
      },
      {
        "name": "repeat",
        "kw": "repetir rotina habito"
      },
      {
        "name": "target",
        "kw": "meta objetivo foco"
      },
      {
        "name": "flag-outline",
        "kw": "bandeira marco"
      },
      {
        "name": "star-outline",
        "kw": "estrela favorito"
      },
      {
        "name": "heart-outline",
        "kw": "coracao amor"
      },
      {
        "name": "lightbulb-outline",
        "kw": "ideia lampada"
      },
      {
        "name": "timer-outline",
        "kw": "cronometro tempo"
      },
      {
        "name": "notebook-outline",
        "kw": "caderno anotar diario"
      },
      {
        "name": "weather-sunset-up",
        "kw": "amanhecer nascer sol manha"
      },
      {
        "name": "weather-night",
        "kw": "noite lua"
      }
    ]
  },
  {
    "title": "Casa",
    "icons": [
      {
        "name": "home-outline",
        "kw": "casa lar"
      },
      {
        "name": "broom",
        "kw": "vassoura limpar varrer"
      },
      {
        "name": "washing-machine",
        "kw": "lavar roupa maquina"
      },
      {
        "name": "sofa-outline",
        "kw": "sofa sala descansar"
      },
      {
        "name": "shower",
        "kw": "banho chuveiro"
      },
      {
        "name": "toothbrush",
        "kw": "escovar dentes"
      },
      {
        "name": "lotion-outline",
        "kw": "hidratante cuidados pele autocuidado"
      },
      {
        "name": "hanger",
        "kw": "roupa cabide"
      },
      {
        "name": "trash-can-outline",
        "kw": "lixo"
      },
      {
        "name": "flower-outline",
        "kw": "flor planta jardim"
      },
      {
        "name": "paw",
        "kw": "pet cachorro gato animal"
      },
      {
        "name": "car-outline",
        "kw": "carro"
      },
      {
        "name": "cart-outline",
        "kw": "compras mercado"
      },
      {
        "name": "key-outline",
        "kw": "chave"
      },
      {
        "name": "tractor",
        "kw": "trator fazenda"
      }
    ]
  },
  {
    "title": "Saúde e esporte",
    "icons": [
      {
        "name": "run",
        "kw": "correr corrida"
      },
      {
        "name": "walk",
        "kw": "caminhar"
      },
      {
        "name": "dumbbell",
        "kw": "academia musculacao treino"
      },
      {
        "name": "arm-flex-outline",
        "kw": "forca braco treino"
      },
      {
        "name": "bike",
        "kw": "bicicleta"
      },
      {
        "name": "swim",
        "kw": "natacao nadar"
      },
      {
        "name": "yoga",
        "kw": "yoga alongar"
      },
      {
        "name": "meditation",
        "kw": "meditar"
      },
      {
        "name": "heart-pulse",
        "kw": "saude coracao"
      },
      {
        "name": "pill",
        "kw": "remedio vitamina suplemento"
      },
      {
        "name": "water-outline",
        "kw": "agua beber"
      },
      {
        "name": "brain",
        "kw": "mente psicologa terapia"
      },
      {
        "name": "sleep",
        "kw": "sono dormir"
      },
      {
        "name": "hospital-box-outline",
        "kw": "medico hospital consulta"
      },
      {
        "name": "scale-bathroom",
        "kw": "peso balanca"
      },
      {
        "name": "soccer",
        "kw": "futebol"
      },
      {
        "name": "basketball",
        "kw": "basquete"
      },
      {
        "name": "tooth-outline",
        "kw": "dentista dente"
      }
    ]
  },
  {
    "title": "Trabalho e estudo",
    "icons": [
      {
        "name": "briefcase-outline",
        "kw": "trabalho"
      },
      {
        "name": "laptop",
        "kw": "computador notebook"
      },
      {
        "name": "book-open-page-variant-outline",
        "kw": "ler livro leitura estudar"
      },
      {
        "name": "book-multiple-outline",
        "kw": "livros estudar concurso"
      },
      {
        "name": "school-outline",
        "kw": "escola curso aula"
      },
      {
        "name": "pencil-outline",
        "kw": "escrever lapis"
      },
      {
        "name": "file-document-outline",
        "kw": "documento arquivo"
      },
      {
        "name": "email-outline",
        "kw": "email e-mail carta"
      },
      {
        "name": "at",
        "kw": "arroba email"
      },
      {
        "name": "phone-outline",
        "kw": "telefone ligar"
      },
      {
        "name": "chart-line",
        "kw": "grafico resultados"
      },
      {
        "name": "calculator-variant-outline",
        "kw": "calculadora contas"
      },
      {
        "name": "translate",
        "kw": "idioma ingles traduzir"
      },
      {
        "name": "account-voice",
        "kw": "falar conversar voz"
      },
      {
        "name": "account-group-outline",
        "kw": "reuniao equipe grupo"
      },
      {
        "name": "presentation",
        "kw": "apresentacao"
      },
      {
        "name": "code-tags",
        "kw": "codigo programar"
      },
      {
        "name": "folder-outline",
        "kw": "pasta projeto"
      },
      {
        "name": "clipboard-text-outline",
        "kw": "lista plano"
      }
    ]
  },
  {
    "title": "Lazer",
    "icons": [
      {
        "name": "gamepad-variant-outline",
        "kw": "jogar game videogame"
      },
      {
        "name": "movie-open-outline",
        "kw": "filme cinema video editar"
      },
      {
        "name": "popcorn",
        "kw": "pipoca filme serie"
      },
      {
        "name": "music-note",
        "kw": "musica"
      },
      {
        "name": "headphones",
        "kw": "fone ouvir podcast"
      },
      {
        "name": "palette-outline",
        "kw": "arte pintar design canva"
      },
      {
        "name": "brush",
        "kw": "pincel desenhar figma"
      },
      {
        "name": "camera-outline",
        "kw": "foto camera"
      },
      {
        "name": "guitar-acoustic",
        "kw": "violao instrumento"
      },
      {
        "name": "microphone-outline",
        "kw": "microfone gravar live"
      },
      {
        "name": "dice-multiple-outline",
        "kw": "dados jogo rpg"
      },
      {
        "name": "puzzle-outline",
        "kw": "quebra-cabeca"
      },
      {
        "name": "television",
        "kw": "tv serie assistir"
      },
      {
        "name": "twitch",
        "kw": "twitch live stream"
      },
      {
        "name": "youtube",
        "kw": "youtube video"
      },
      {
        "name": "cards-playing-outline",
        "kw": "cartas baralho"
      },
      {
        "name": "chess-pawn",
        "kw": "xadrez"
      }
    ]
  },
  {
    "title": "Comida",
    "icons": [
      {
        "name": "coffee-outline",
        "kw": "cafe"
      },
      {
        "name": "silverware-fork-knife",
        "kw": "almoco jantar refeicao comer"
      },
      {
        "name": "pasta",
        "kw": "macarrao jantar"
      },
      {
        "name": "food-apple-outline",
        "kw": "fruta maca"
      },
      {
        "name": "pizza",
        "kw": "pizza"
      },
      {
        "name": "bread-slice-outline",
        "kw": "pao"
      },
      {
        "name": "egg-outline",
        "kw": "ovo"
      },
      {
        "name": "cupcake",
        "kw": "doce bolo"
      },
      {
        "name": "glass-cocktail",
        "kw": "bebida drink"
      },
      {
        "name": "cookie-outline",
        "kw": "biscoito"
      },
      {
        "name": "food-drumstick-outline",
        "kw": "carne frango"
      },
      {
        "name": "ice-cream",
        "kw": "sorvete"
      },
      {
        "name": "beer-outline",
        "kw": "cerveja"
      }
    ]
  },
  {
    "title": "Outros",
    "icons": [
      {
        "name": "hands-pray",
        "kw": "rezar oracao fe"
      },
      {
        "name": "airplane",
        "kw": "viagem aviao"
      },
      {
        "name": "map-marker-outline",
        "kw": "lugar local"
      },
      {
        "name": "wallet-outline",
        "kw": "dinheiro carteira"
      },
      {
        "name": "cash",
        "kw": "dinheiro"
      },
      {
        "name": "gift-outline",
        "kw": "presente"
      },
      {
        "name": "tree-outline",
        "kw": "arvore natureza"
      },
      {
        "name": "weather-sunny",
        "kw": "sol"
      },
      {
        "name": "moon-waning-crescent",
        "kw": "lua"
      },
      {
        "name": "fire",
        "kw": "fogo"
      },
      {
        "name": "lightning-bolt-outline",
        "kw": "energia raio"
      },
      {
        "name": "bank-outline",
        "kw": "banco"
      },
      {
        "name": "credit-card-outline",
        "kw": "cartao"
      },
      {
        "name": "bus",
        "kw": "onibus"
      },
      {
        "name": "train",
        "kw": "trem"
      },
      {
        "name": "umbrella-outline",
        "kw": "guarda-chuva"
      }
    ]
  }
];
