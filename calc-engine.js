// Competências de 2026. Fontes e limites documentados em docs/CALCULADORAS.md.
export const round = n => Math.round((n + Number.EPSILON * Math.max(1,Math.abs(n))) * 100) / 100;
export const CEILING = 8475.55;
const bounds = [180000,360000,720000,1800000,3600000];
export const annexes = {
 I:[[4,0],[7.3,5940],[9.5,13860],[10.7,22500],[14.3,87300]],
 II:[[4.5,0],[7.8,5940],[10,13860],[11.2,22500],[14.7,85500]],
 III:[[6,0],[11.2,9360],[13.5,17640],[16,35640],[21,125640]],
 IV:[[4.5,0],[9,8100],[10.2,12420],[14,39780],[22,183780]],
 V:[[15.5,0],[18,4500],[19.5,9900],[20.5,17100],[23,62100]]
};
function number(value,label,max=1e12){if(value===''||value==null||!Number.isFinite(Number(value))||Number(value)<0||Number(value)>max)throw Error('Confira '+label+'. Informe um número válido entre 0 e '+max.toLocaleString('pt-BR')+'.');return Number(value)}
export function employeeINSS(gross){number(gross,'remuneração');let previous=0,total=0;for(const [cap,rate] of [[1621,.075],[2902.84,.09],[4354.27,.12],[CEILING,.14]]){total+=Math.max(0,Math.min(gross,cap)-previous)*rate;previous=cap;}return round(total)}
export function incomeTax(gross,social=0,dependents=0,pension=0){
 number(gross,'rendimentos');number(social,'INSS');number(pension,'pensão');number(dependents,'dependentes',30);if(!Number.isInteger(dependents))throw Error('Dependentes deve ser um número inteiro.');
 const legal=round(social+dependents*189.59+pension),deduction=Math.max(legal,607.2),base=round(Math.max(0,gross-deduction));
 const [rate,offset]=base<=2428.8?[0,0]:base<=2826.65?[.075,182.16]:base<=3751.05?[.15,394.16]:base<=4664.68?[.225,675.49]:[.275,908.73];
 const before=round(Math.max(0,base*rate-offset));
 const reduction=round(Math.min(before,gross<=5000?312.89:gross<=7350?Math.max(0,978.62-.133145*gross):0));
 return {tax:round(Math.max(0,before-reduction)),base,deduction,method:legal>=607.2?'Deduções legais':'Desconto simplificado',before,reduction};
}
export function factorR(payroll,revenue){number(payroll,'folha');number(revenue,'receita');return revenue===0?(payroll>0?.28:.01):payroll===0?.01:payroll/revenue}
export function simples(annex,revenue,monthly){
 number(revenue,'RBT12',3600000);number(monthly,'receita do mês');if(!annexes[annex])throw Error('Selecione um anexo válido.');if(revenue===0)throw Error('Informe RBT12 maior que zero. Início de atividade exige cálculo proporcional específico.');
 const band=bounds.findIndex(cap=>revenue<=cap),[nominal,deduction]=annexes[annex][band];const effective=(revenue*nominal/100-deduction)/revenue;
 return {tax:round(monthly*effective),effective,band:band+1,nominal,deduction,annex};
}
export function remuneration(kind,data,exclusive=false){
 const gross=number(data.gross,'valor bruto'),deps=number(data.dependents??0,'dependentes',30),pension=number(data.pension??0,'pensão'),other=number(data.other??0,'outros descontos');
 const social=kind==='salario'?employeeINSS(gross):round(Math.min(gross,CEILING)*.11);
 const ir=incomeTax(gross,social,deps,pension);
 ir.waived=!exclusive&&ir.tax>0&&ir.tax<=10;
 if(ir.waived)ir.tax=0;
 const iss=kind==='rpa'?round(gross*number(data.iss??0,'alíquota de ISS',5)/100):0;
 const net=round(gross-social-ir.tax-iss-pension-other);
 if(net<0)throw Error('Os descontos superam o valor bruto. Confira os valores.');
 return {gross,social,ir,iss,pension,other,net};
}
export function calculate(type,d){
 const n=(key,label=key,max)=>number(d[key],label,max),cash=n=>n.toLocaleString('pt-BR',{style:'currency',currency:'BRL'}),pct=n=>(n*100).toLocaleString('pt-BR',{maximumFractionDigits:4})+'%';
 const result=(label,value,rows,notes=[])=>({label,value,rows,notes});
 if(['salario','pro-labore','rpa'].includes(type)){
  const x=remuneration(type,d);return result('Valor líquido estimado',cash(x.net),[['Valor bruto',cash(x.gross)],['INSS do segurado',cash(x.social)],['Dedução do IR · '+x.ir.method,cash(x.ir.deduction)],['Base do IRRF',cash(x.ir.base)],['IR antes da redução',cash(x.ir.before)],['Redução de 2026',cash(x.ir.reduction)],['IRRF',cash(x.ir.tax)],...(type==='rpa'?[['ISS informado',cash(x.iss)]]:[]),['Pensão descontada',cash(x.pension)],['Outros descontos',cash(x.other)]],[...(x.ir.waived?['IRRF mensal dispensado por valor de até R$ 10,00, conforme art. 67 da Lei 9.430.']:[]),...(x.gross>0&&x.gross<1621?['Remuneração abaixo do mínimo: avalie complementação previdenciária conforme seu caso.']:[])]);
 }
 if(type==='fator-r'){
  const revenue=n('rbt','receita'),payroll=n('payroll','folha'),r=factorR(payroll,revenue);
  return result('Fator R',pct(r),[['Folha elegível',cash(payroll)],['Receita do período',cash(revenue)],['Anexo indicado',r>=.28?'III':'V'],['Folha faltante para 28%',cash(Math.max(0,revenue*.28-payroll))]],['Somente atividades sujeitas ao Fator R. Classificação usa o valor sem arredondar.',...(revenue===0||payroll===0?['Aplicada a regra específica para folha ou receita zerada (art. 26 da Resolução CGSN 140).']:[])]);
 }
 if(type==='simples-nacional'||type==='impostos'){
  const x=simples(d.annex,n('rbt','RBT12'),n('monthly','receita do mês'));
  return result('DAS estimado',cash(x.tax),[['Anexo',x.annex],['Faixa',String(x.band)],['Alíquota nominal',pct(x.nominal/100)],['Parcela a deduzir',cash(x.deduction)],['Alíquota efetiva',pct(x.effective)],['Receita do mês',cash(n('monthly'))]],x.annex==='IV'?['A contribuição previdenciária patronal do Anexo IV é recolhida fora do DAS e não está incluída.']:[]);
 }
 if(type==='custo-abrir-empresa'){
  const rows=[['registry','Registro'],['license','Licenças'],['certificate','Certificado'],['service','Honorários'],['other','Outros custos']];const sum=round(rows.reduce((t,[key,label])=>t+n(key,label),0));return result('Orçamento inicial',cash(sum),rows.map(([key,label])=>[label,cash(n(key))]),['Valores de orçamento informados por você. Não existe uma taxa nacional única de abertura.']);
 }
 if(type==='pj-clt'){
  const gross=n('clt','salário bruto'),deps=n('dependents','dependentes',30),benefits=n('benefits','benefícios'),pj=n('pj','receita PJ'),months=n('months','meses faturados',12),rate=n('rate','alíquota PJ',100),cost=n('cost','custos PJ'),personal=n('personal','INSS e IR pessoais do sócio');
  if(!Number.isInteger(months)||months<1)throw Error('Informe entre 1 e 12 meses inteiros de faturamento.');
  const normal=remuneration('salario',{gross,dependents:deps}),vacation=remuneration('salario',{gross:round(gross*4/3),dependents:deps});
  const thirteenth=remuneration('salario',{gross,dependents:deps},true);
  const clt=round(normal.net*11+thirteenth.net+vacation.net+benefits*12),tax=round(pj*months*rate/100),pjNet=round(pj*months-tax-(cost+personal)*12),fgts=round(gross*(13+1/3)*.08);
  return result('Diferença anual estimada',cash(Math.abs(pjNet-clt)),[['Maior disponibilidade no cenário',pjNet===clt?'Empate':pjNet>clt?'PJ':'CLT'],['CLT · mês normal líquido',cash(normal.net)],['CLT · férias com 1/3 líquidas',cash(vacation.net)],['CLT · 13º líquido estimado',cash(thirteenth.net)],['CLT · benefícios anuais',cash(benefits*12)],['CLT · total anual disponível',cash(clt)],['FGTS estimado (separado)',cash(fgts)],['PJ · receita anual',cash(pj*months)],['PJ · tributos da empresa',cash(tax)],['PJ · custos anuais',cash(cost*12)],['PJ · tributos pessoais anuais',cash(personal*12)],['PJ · saldo anual',cash(pjNet)]],['CLT: 11 salários normais + férias de 30 dias com 1/3 + 13º integral. Sem rescisão, adicionais ou ajuste anual do IR.','FGTS não é somado ao dinheiro disponível. PJ exige alíquota efetiva e tributos pessoais validados; saldo não equivale a lucro distribuível.']);
 }
 throw Error('Calculadora não encontrada.');
}
