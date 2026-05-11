import { PieChart, Pie, Cell, ResponsiveContainer, Tooltip } from "recharts";
import { Pedido } from "@/funcionalidades/producao/projetos/tipos";
import { StatusPedido } from "@/compartilhado/tipos/modelos";

interface PropriedadesGraficoStatus {
  pedidos: Pedido[];
}

export function GraficoStatus({ pedidos }: PropriedadesGraficoStatus) {
  const dadosStatus = [
    { name: "Concluído", value: pedidos.filter(p => p.status === StatusPedido.CONCLUIDO).length, color: "#10b981" },
    { name: "Produção", value: pedidos.filter(p => p.status === StatusPedido.EM_PRODUCAO).length, color: "#0ea5e9" },
    { name: "Fila", value: pedidos.filter(p => p.status === StatusPedido.A_FAZER).length, color: "#f59e0b" },
    { name: "Acabamento", value: pedidos.filter(p => p.status === StatusPedido.ACABAMENTO).length, color: "#8b5cf6" },
  ].filter(d => d.value > 0);

  const total = pedidos.length;

  return (
    <div className="bg-card border border-borda-sutil rounded-3xl p-8 flex flex-col h-full relative overflow-hidden group shadow-media">
      <div className="absolute -left-10 -bottom-10 w-40 h-40 bg-zinc-500/5 blur-[60px] pointer-events-none" />
      
      <div className="mb-6 relative z-10">
        <h3 className="text-muted text-[10px] font-black uppercase tracking-[0.2em] mb-1">Carga de Trabalho</h3>
        <div className="text-xl font-black text-primary tracking-tighter uppercase">Status da Fila</div>
      </div>
      
      <div className="flex-1 min-h-[220px] relative flex items-center justify-center z-10">
        <ResponsiveContainer width="100%" height="100%">
          <PieChart>
            <Pie
              data={dadosStatus}
              cx="50%"
              cy="50%"
              innerRadius={65}
              outerRadius={85}
              paddingAngle={6}
              dataKey="value"
              animationDuration={1500}
            >
              {dadosStatus.map((entry, index) => (
                <Cell key={`cell-${index}`} fill={entry.color} stroke="transparent" />
              ))}
            </Pie>
            <Tooltip 
              contentStyle={{ 
                backgroundColor: '#0c0c0e', 
                border: '1px solid rgba(255,255,255,0.1)', 
                borderRadius: '12px',
                fontSize: '10px',
                fontWeight: '900',
                textTransform: 'uppercase'
              }}
              itemStyle={{ color: '#fff' }}
            />
          </PieChart>
        </ResponsiveContainer>
        
        <div className="absolute inset-0 flex flex-col items-center justify-center pointer-events-none">
          <span className="text-3xl font-black text-primary tracking-tighter tabular-nums">{total}</span>
          <span className="text-[8px] font-black text-zinc-500 uppercase tracking-widest">PEDIDOS</span>
        </div>
      </div>
    </div>
  );
}

