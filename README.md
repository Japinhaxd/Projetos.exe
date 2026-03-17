# Monitoramento de Rede Local

Este projeto cria um dashboard web em tempo real para monitoramento de rede local usando Python, Dash e Plotly.

## Funcionalidades

- **Backend**: Coleta métricas de rede em tempo real usando psutil
- **Frontend**: Dashboard web responsivo com gráficos atualizados a cada segundo
- **Interface**: Detecta automaticamente a interface de rede ativa
- **Execução**: Processo único com threads daemon, fácil de encerrar com Ctrl+C

## Instalação

1. Instale as dependências:
   ```
   pip install -r requirements.txt
   ```

## Execução

Execute o script principal:
```
python monitor.py
```

O terminal exibirá apenas o link de acesso, por exemplo:
```
Acesse o dashboard em: http://192.168.1.100:8050/
```

## Dashboard

O dashboard inclui:
- Gráfico de throughput (bytes enviados/recebidos por segundo)
- Gráfico de pacotes por segundo
- Tabela com todas as interfaces de rede ativas e suas estatísticas

## Encerramento

Pressione Ctrl+C no terminal para encerrar o monitoramento e o servidor web.