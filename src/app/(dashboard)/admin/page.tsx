import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { DropdownMenu, DropdownMenuContent, DropdownMenuItem, DropdownMenuLabel, DropdownMenuTrigger } from "@/components/ui/dropdown-menu";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { MoreHorizontal } from "lucide-react";

const users = [
    { id: 'usr_1', name: 'João da Silva', email: 'joao.silva@example.com', role: 'Motorista', status: 'Ativo' },
    { id: 'usr_2', name: 'Frota Rápida SP', email: 'contato@frotarapida.com', role: 'Frota', status: 'Ativo' },
    { id: 'usr_3', name: 'Maria Oliveira', email: 'maria.o@example.com', role: 'Motorista', status: 'Pendente' },
    { id: 'usr_4', name: 'Carlos Souza', email: 'carlos.souza@example.com', role: 'Motorista', status: 'Inativo' },
];

const opportunities = [
    { id: 'opp_1', title: 'Motorista Turno da Noite', company: 'Frota Rápida SP', status: 'Aprovado' },
    { id: 'opp_2', title: 'Vaga para Aeroporto GUA', company: 'Cooperativa Alfa', status: 'Pendente' },
    { id: 'opp_3', title: 'Motorista Fim de Semana', company: 'Táxi Legal', status: 'Rejeitado' },
    { id: 'opp_4', title: 'Motorista Bilíngue (Eventos)', company: 'SP TuriTaxi', status: 'Pendente' },
];

const courses = [
    { id: 'crs_1', name: 'Legislação de Trânsito', enrolled: 152, completion: '85%' },
    { id: 'crs_2', name: 'Inglês para Atendimento', enrolled: 98, completion: '62%' },
    { id: 'crs_3', name: 'Direção Defensiva', enrolled: 210, completion: '91%' },
];

export default function AdminPage() {
    return (
        <div className="flex flex-col gap-8">
            <div>
                <h1 className="font-headline text-3xl font-bold tracking-tight">Painel Administrativo</h1>
                <p className="text-muted-foreground">Gerencie usuários, oportunidades e cursos da plataforma.</p>
            </div>

            <Tabs defaultValue="users">
                <TabsList className="grid w-full grid-cols-3">
                    <TabsTrigger value="users">Usuários</TabsTrigger>
                    <TabsTrigger value="opportunities">Oportunidades</TabsTrigger>
                    <TabsTrigger value="courses">Cursos</TabsTrigger>
                </TabsList>
                <TabsContent value="users">
                    <Card>
                        <CardHeader>
                            <CardTitle>Gerenciar Usuários</CardTitle>
                            <CardDescription>Visualize e gerencie todos os usuários cadastrados.</CardDescription>
                        </CardHeader>
                        <CardContent>
                            <Table>
                                <TableHeader>
                                    <TableRow>
                                        <TableHead>Nome</TableHead>
                                        <TableHead>Perfil</TableHead>
                                        <TableHead>Status</TableHead>
                                        <TableHead>Ações</TableHead>
                                    </TableRow>
                                </TableHeader>
                                <TableBody>
                                    {users.map(user => (
                                        <TableRow key={user.id}>
                                            <TableCell>
                                                <div className="font-medium">{user.name}</div>
                                                <div className="text-sm text-muted-foreground">{user.email}</div>
                                            </TableCell>
                                            <TableCell>{user.role}</TableCell>
                                            <TableCell><Badge variant={user.status === 'Ativo' ? 'default' : user.status === 'Pendente' ? 'secondary' : 'destructive'} className={user.status === 'Ativo' ? "bg-green-500/20 text-green-700" : ""}>{user.status}</Badge></TableCell>
                                            <TableCell>
                                                <DropdownMenu>
                                                    <DropdownMenuTrigger asChild><Button variant="ghost" size="icon"><MoreHorizontal /></Button></DropdownMenuTrigger>
                                                    <DropdownMenuContent>
                                                        <DropdownMenuLabel>Ações</DropdownMenuLabel>
                                                        <DropdownMenuItem>Editar</DropdownMenuItem>
                                                        <DropdownMenuItem>Desativar</DropdownMenuItem>
                                                    </DropdownMenuContent>
                                                </DropdownMenu>
                                            </TableCell>
                                        </TableRow>
                                    ))}
                                </TableBody>
                            </Table>
                        </CardContent>
                    </Card>
                </TabsContent>
                <TabsContent value="opportunities">
                    <Card>
                        <CardHeader>
                            <CardTitle>Aprovar Anúncios</CardTitle>
                            <CardDescription>Modere as oportunidades postadas na plataforma.</CardDescription>
                        </CardHeader>
                        <CardContent>
                            <Table>
                                <TableHeader>
                                    <TableRow>
                                        <TableHead>Título da Vaga</TableHead>
                                        <TableHead>Empresa</TableHead>
                                        <TableHead>Status</TableHead>
                                        <TableHead>Ações</TableHead>
                                    </TableRow>
                                </TableHeader>
                                <TableBody>
                                    {opportunities.map(opp => (
                                        <TableRow key={opp.id}>
                                            <TableCell className="font-medium">{opp.title}</TableCell>
                                            <TableCell>{opp.company}</TableCell>
                                            <TableCell><Badge variant={opp.status === 'Aprovado' ? 'default' : opp.status === 'Pendente' ? 'secondary' : 'destructive'} className={opp.status === 'Aprovado' ? "bg-green-500/20 text-green-700" : ""}>{opp.status}</Badge></TableCell>
                                            <TableCell>
                                                 {opp.status === 'Pendente' && (
                                                    <div className="flex gap-2">
                                                        <Button variant="outline" size="sm" className="border-green-500 text-green-600 hover:bg-green-500/10 hover:text-green-700">Aprovar</Button>
                                                        <Button variant="outline" size="sm" className="border-red-500 text-red-600 hover:bg-red-500/10 hover:text-red-700">Rejeitar</Button>
                                                    </div>
                                                 )}
                                            </TableCell>
                                        </TableRow>
                                    ))}
                                </TableBody>
                            </Table>
                        </CardContent>
                    </Card>
                </TabsContent>
                <TabsContent value="courses">
                    <Card>
                        <CardHeader>
                            <CardTitle>Desempenho dos Cursos</CardTitle>
                            <CardDescription>Monitore a performance e engajamento dos cursos.</CardDescription>
                        </CardHeader>
                        <CardContent>
                            <Table>
                                <TableHeader>
                                    <TableRow>
                                        <TableHead>Nome do Curso</TableHead>
                                        <TableHead>Inscritos</TableHead>
                                        <TableHead>Taxa de Conclusão</TableHead>
                                        <TableHead>Ações</TableHead>
                                    </TableRow>
                                </TableHeader>
                                <TableBody>
                                    {courses.map(course => (
                                        <TableRow key={course.id}>
                                            <TableCell className="font-medium">{course.name}</TableCell>
                                            <TableCell>{course.enrolled}</TableCell>
                                            <TableCell>{course.completion}</TableCell>
                                            <TableCell>
                                                <DropdownMenu>
                                                    <DropdownMenuTrigger asChild><Button variant="ghost" size="icon"><MoreHorizontal /></Button></DropdownMenuTrigger>
                                                    <DropdownMenuContent>
                                                        <DropdownMenuLabel>Ações</DropdownMenuLabel>
                                                        <DropdownMenuItem>Ver Detalhes</DropdownMenuItem>
                                                        <DropdownMenuItem>Editar</DropdownMenuItem>
                                                    </DropdownMenuContent>
                                                </DropdownMenu>
                                            </TableCell>
                                        </TableRow>
                                    ))}
                                </TableBody>
                            </Table>
                        </CardContent>
                    </Card>
                </TabsContent>
            </Tabs>
        </div>
    );
}
