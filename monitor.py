import psutil
import dash
from dash import html, dcc, Input, Output
import plotly.graph_objects as go
from plotly.subplots import make_subplots
import threading
import time
from collections import deque
import socket
import logging
import signal
import sys
from contextlib import redirect_stdout
import io

# Suprimir logs do Dash/Flask
logging.getLogger('werkzeug').setLevel(logging.CRITICAL)
logging.getLogger('dash').setLevel(logging.CRITICAL)
logging.getLogger('flask').setLevel(logging.CRITICAL)
logging.getLogger('urllib3').setLevel(logging.CRITICAL)
logging.disable(logging.CRITICAL)

# Configurações
WINDOW_SIZE = 60  # 60 segundos
UPDATE_INTERVAL = 1  # 1 segundo

class NetworkMonitor(threading.Thread):
    def __init__(self, interface):
        super().__init__(daemon=True)
        self.interface = interface
        self.running = True
        self.data = {
            'time': deque(maxlen=WINDOW_SIZE),
            'bytes_sent': deque(maxlen=WINDOW_SIZE),
            'bytes_recv': deque(maxlen=WINDOW_SIZE),
            'packets_sent': deque(maxlen=WINDOW_SIZE),
            'packets_recv': deque(maxlen=WINDOW_SIZE),
            'errin': deque(maxlen=WINDOW_SIZE),
            'errout': deque(maxlen=WINDOW_SIZE),
            'dropin': deque(maxlen=WINDOW_SIZE),
            'dropout': deque(maxlen=WINDOW_SIZE),
        }
        self.last_stats = None

    def run(self):
        while self.running:
            try:
                stats = psutil.net_io_counters(pernic=True).get(self.interface)
                if stats and self.last_stats:
                    current_time = time.time()
                    self.data['time'].append(current_time)
                    self.data['bytes_sent'].append(stats.bytes_sent - self.last_stats.bytes_sent)
                    self.data['bytes_recv'].append(stats.bytes_recv - self.last_stats.bytes_recv)
                    self.data['packets_sent'].append(stats.packets_sent - self.last_stats.packets_sent)
                    self.data['packets_recv'].append(stats.packets_recv - self.last_stats.packets_recv)
                    self.data['errin'].append(stats.errin - self.last_stats.errin)
                    self.data['errout'].append(stats.errout - self.last_stats.errout)
                    self.data['dropin'].append(stats.dropin - self.last_stats.dropin)
                    self.data['dropout'].append(stats.dropout - self.last_stats.dropout)
                self.last_stats = stats
                time.sleep(UPDATE_INTERVAL)
            except Exception as e:
                print(f"Erro na coleta de dados: {e}")
                time.sleep(UPDATE_INTERVAL)

    def stop(self):
        self.running = False

    def get_data(self):
        return dict(self.data)

def get_local_ip():
    try:
        s = socket.socket(socket.AF_INET, socket.SOCK_DGRAM)
        s.connect(("8.8.8.8", 80))
        ip = s.getsockname()[0]
        s.close()
        return ip
    except:
        return "127.0.0.1"

def get_active_interface():
    interfaces = psutil.net_if_addrs()
    io_counters = psutil.net_io_counters(pernic=True)
    active = None
    max_traffic = 0
    for iface in interfaces:
        if iface in io_counters:
            stats = io_counters[iface]
            traffic = stats.bytes_sent + stats.bytes_recv
            if traffic > max_traffic:
                max_traffic = traffic
                active = iface
    return active or list(interfaces.keys())[0]  # fallback para primeira interface

def get_all_interfaces_data():
    io_counters = psutil.net_io_counters(pernic=True)
    data = []
    for iface, stats in io_counters.items():
        data.append({
            'Interface': iface,
            'Bytes Sent': stats.bytes_sent,
            'Bytes Recv': stats.bytes_recv,
            'Packets Sent': stats.packets_sent,
            'Packets Recv': stats.packets_recv,
            'Errors In': stats.errin,
            'Errors Out': stats.errout,
            'Drops In': stats.dropin,
            'Drops Out': stats.dropout,
        })
    return data

# Dash App
app = dash.Dash(__name__)

app.layout = html.Div([
    html.H1("Monitoramento de Rede Local", style={'textAlign': 'center'}),
    dcc.Interval(id='interval-component', interval=UPDATE_INTERVAL*1000, n_intervals=0),
    html.Div([
        html.Div([
            dcc.Graph(id='throughput-graph'),
        ], style={'width': '50%', 'display': 'inline-block'}),
        html.Div([
            dcc.Graph(id='packets-graph'),
        ], style={'width': '50%', 'display': 'inline-block'}),
    ]),
    html.Div([
        html.H3("Interfaces de Rede"),
        dcc.Graph(id='interfaces-table'),
    ], style={'marginTop': '20px'}),
])

@app.callback(
    [Output('throughput-graph', 'figure'),
     Output('packets-graph', 'figure'),
     Output('interfaces-table', 'figure')],
    Input('interval-component', 'n_intervals')
)
def update_graphs(n):
    data = monitor.get_data()
    times = list(data['time'])
    if not times:
        # Dados vazios
        fig1 = go.Figure()
        fig1.add_trace(go.Scatter(x=[], y=[], mode='lines', name='Sent'))
        fig1.add_trace(go.Scatter(x=[], y=[], mode='lines', name='Recv'))
        fig1.update_layout(title="Throughput (bytes/s)", xaxis_title="Time", yaxis_title="Bytes/s")

        fig2 = go.Figure()
        fig2.add_trace(go.Scatter(x=[], y=[], mode='lines', name='Packets Sent'))
        fig2.add_trace(go.Scatter(x=[], y=[], mode='lines', name='Packets Recv'))
        fig2.update_layout(title="Packets per second", xaxis_title="Time", yaxis_title="Packets/s")

        interfaces_data = get_all_interfaces_data()
        fig3 = go.Figure(data=[go.Table(
            header=dict(values=list(interfaces_data[0].keys())),
            cells=dict(values=[list(d.values()) for d in interfaces_data])
        )])
        return fig1, fig2, fig3

    # Throughput
    fig1 = make_subplots(rows=1, cols=1)
    fig1.add_trace(go.Scatter(x=times, y=list(data['bytes_sent']), mode='lines', name='Bytes Sent'), row=1, col=1)
    fig1.add_trace(go.Scatter(x=times, y=list(data['bytes_recv']), mode='lines', name='Bytes Recv'), row=1, col=1)
    fig1.update_layout(title="Throughput (bytes/s)", xaxis_title="Time", yaxis_title="Bytes/s")

    # Packets
    fig2 = make_subplots(rows=1, cols=1)
    fig2.add_trace(go.Scatter(x=times, y=list(data['packets_sent']), mode='lines', name='Packets Sent'), row=1, col=1)
    fig2.add_trace(go.Scatter(x=times, y=list(data['packets_recv']), mode='lines', name='Packets Recv'), row=1, col=1)
    fig2.update_layout(title="Packets per second", xaxis_title="Time", yaxis_title="Packets/s")

    # Interfaces table
    interfaces_data = get_all_interfaces_data()
    fig3 = go.Figure(data=[go.Table(
        header=dict(values=list(interfaces_data[0].keys())),
        cells=dict(values=[list(d.values()) for d in interfaces_data])
    )])

    return fig1, fig2, fig3

def signal_handler(sig, frame):
    print("Encerrando...")
    monitor.stop()
    sys.exit(0)

if __name__ == '__main__':
    interface = get_active_interface()

    monitor = NetworkMonitor(interface)
    monitor.start()

    local_ip = get_local_ip()
    print(f"Acesse o dashboard em: http://{local_ip}:8050/")

    signal.signal(signal.SIGINT, signal_handler)

    # Suprimir logs do servidor
    with redirect_stdout(io.StringIO()):
        app.run(host='0.0.0.0', port=8050, debug=False)