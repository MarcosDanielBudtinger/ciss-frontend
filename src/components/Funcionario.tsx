import { FormEvent, useEffect, useState } from "react";
import { Button, Col, Container, Form, Image, Modal, Navbar, Row, Table } from "react-bootstrap";
import { api } from "../services/api";
import logoImg from '../images/logotipo-cisswhite.svg';
import { BsTrash } from "react-icons/bs";
import { BsPencil } from "react-icons/bs";
import Swal from 'sweetalert2';

interface Funcionario {
    id: number;
    nome: string;
    sobrenome: string;
    email: string;
    numeroNis: string;
}

interface Erro {
    mensagemUsuario: string;
    mensagemDesenvolvedor: string;
}

export function Funcionario() {

    const [funcionarios, setFuncionarios] = useState<Funcionario[]>([]);
    const [funcionario, setFuncionario] = useState<Funcionario>();
    const [show, setShow] = useState(false);
    const [id, setId] = useState(0);
    const [nome, setNome] = useState('');
    const [sobrenome, setSobrenome] = useState('');
    const [email, setEmail] = useState('');
    const [numeroNis, setNumeroNis] = useState('');
    const [erro, setErro] = useState<Erro[]>([]);

    const [criterio, setCriterio] = useState('');
    const [pesquisa, setPesquisa] = useState('');

    useEffect(() => {
        listaFuncionarios();
    }, [pesquisa]);

    function listaFuncionarios() {
        let url = "funcionarios";
        if (criterio) {
            url = url + `?${criterio}=${pesquisa}`;
        }
        api.get(url)
            .then(response => {
                if (response.status === 200) {
                    setFuncionarios(response.data.content);
                }
            }).catch((error) => {
                throw error;
            }
            );
    }

    const handleClose = () => {
        setShow(false);
        limpaCampos();
    };
    const handleShow = () => setShow(true);

    function handlePesquisar(event: FormEvent) {
        event.preventDefault();

    }

    function handleSalvarFuncionario(event: FormEvent) {
        event.preventDefault();

        const data = {
            id,
            nome,
            sobrenome,
            email,
            numeroNis
        };

        if (data.id !== 0) {
            api.put('/funcionarios/' + data.id, data)
                .then(response => {
                    if (response.status === 200) {
                        handleClose();
                        listaFuncionarios();
                        limpaCampos();
                        Swal.fire('Registro alterado com sucesso!', '', 'success');
                    }
                }).catch((error) => {
                    if (error.response) {
                        setErro(error.response.data);
                        erro.map(e => {
                            alert(e.mensagemUsuario);
                        })
                    }
                });
        } else {
            api.post('/funcionarios', data)
                .then(response => {
                    if (response.status === 201) {
                        handleClose();
                        listaFuncionarios();
                        limpaCampos();
                        Swal.fire('Registro salvo com sucesso!', '', 'success');
                    }
                }).catch((error) => {
                    if (error.response) {
                        setErro(error.response.data);
                        erro.map(e => {
                            Swal.fire({
                                title: 'Erro!',
                                text: e.mensagemUsuario,
                                icon: 'error',
                                confirmButtonText: 'Ok'
                            });
                        })
                    }
                });
        }
    }

    function limpaCampos() {
        setId(0);
        setNome('');
        setSobrenome('');
        setEmail('');
        setNumeroNis('');
    }

    function limparPesquisa() {
        setCriterio('');
        setPesquisa('');
    }

    let deleteFuncionario = (funcionario: Funcionario): void => {
        setFuncionario(funcionario);
        if (funcionario) {
            Swal.fire({
                title: 'Excluir o registro?',
                text: "Voc?? realmente deseja exclui o registro?",
                icon: 'warning',
                showCancelButton: true,
                confirmButtonColor: '#3085d6',
                cancelButtonColor: '#d33',
                confirmButtonText: 'Sim, excluir!',
                cancelButtonText: 'N??o, cancelar'
            }).then((result) => {
                if (result.isConfirmed) {
                    api.delete('funcionarios/' + funcionario.id)
                        .then(response => {
                            if (response.status === 204) {
                                handleClose();
                                listaFuncionarios();
                                limpaCampos();
                            }
                        }).catch((error) => {
                            if (error.response) {
                                setErro(error.response.data);
                                erro.map(e => {
                                    Swal.fire({
                                        title: 'Erro!',
                                        text: e.mensagemUsuario,
                                        icon: 'error',
                                        confirmButtonText: 'Ok'
                                    });
                                })
                            }
                        });
                    Swal.fire(
                        'Sucesso!',
                        'Registro exclu??do com sucesso!',
                        'success'
                    )
                }
            })
        }
    }

    let editarFuncionario = (funcionario: Funcionario): void => {
        setId(funcionario.id);
        setNome(funcionario.nome);
        setSobrenome(funcionario.sobrenome);
        setEmail(funcionario.email);
        setNumeroNis(funcionario.numeroNis);
        handleShow();
    }
    return (
        <>
            <Navbar bg="dark" fixed="top" style={{ minHeight: '150px' }}>
                <Container>
                    <Image src={logoImg} style={{ maxWidth: '200px' }} />
                    <Navbar.Toggle />
                    <Navbar.Collapse className="justify-content-end">
                        <Navbar.Text style={{ color: '#fff' }}>
                            Projeto para fins de teste. Marcos Daniel Budtinger
                        </Navbar.Text>
                    </Navbar.Collapse>
                </Container>
            </Navbar>

            <Container style={{ paddingTop: '13rem' }}>
                <h3>Funcion??rios</h3>
                <div style={{ paddingBottom: '1rem' }}>
                    <Button variant="primary" size="sm" onClick={handleShow} style={{ marginBottom: '1rem' }}>
                        Cadastrar Novo
                    </Button>
                    <Form onSubmit={handlePesquisar}>
                        <Row className="align-items-center">

                            <Row>
                                <Col md>
                                    <Form.Label
                                        className="me-sm-2"
                                        htmlFor="inlineFormCustomSelect"
                                    >
                                        Defina o crit??rio para filtrar
                                    </Form.Label>
                                    <select value={criterio} onChange={event => setCriterio(event.target.value)} required>
                                        <option></option>
                                        <option value="nome">Nome</option>
                                        <option value="sobrenome">Sobrenome</option>
                                        <option value="email">E-mail</option>
                                        <option value="numeroNis">N??mero Nis(Pis)</option>
                                    </select>
                                </Col>
                                <Col md>
                                    <Form.Control placeholder="Escreva aqui o que deseja pesquisar" value={pesquisa} size="sm" required
                                        onChange={event => setPesquisa(event.target.value)} />
                                </Col>
                                <Col md>
                                    <Button type="submit" size="sm">Pesquisar</Button>
                                    <Button type="button" size="sm" style={{ marginLeft: '10px' }} onClick={() => limparPesquisa()}>Limpar filtros</Button>
                                </Col>
                            </Row>
                        </Row>
                    </Form>

                </div>
                <Table striped bordered hover>
                    <thead>
                        <tr>
                            <th className="text-center">C??digo</th>
                            <th>Nome</th>
                            <th>Sobrenome</th>
                            <th>E-mail</th>
                            <th>N??mero nis (PIS)</th>
                            <th className="text-center">Alterar</th>
                            <th className="text-center">Excluir</th>
                        </tr>
                    </thead>
                    <tbody>
                        {funcionarios.map(funcionario => (
                            <tr key={funcionario.id}>
                                <td className="text-center">{funcionario.id}</td>
                                <td>{funcionario.nome}</td>
                                <td>{funcionario.sobrenome}</td>
                                <td>{funcionario.email}</td>
                                <td>{funcionario.numeroNis}</td>
                                <td className="text-center"><Button variant="warning" size="sm" onClick={() => editarFuncionario(funcionario)}><BsPencil /></Button></td>
                                <td className="text-center"><Button variant="danger" size="sm" onClick={() => deleteFuncionario(funcionario)}><BsTrash /></Button></td>
                            </tr>
                        ))}
                    </tbody>
                </Table>
            </Container>

            <Modal show={show} onHide={handleClose} animation={true} size="lg">
                <Form onSubmit={handleSalvarFuncionario}>
                    <Modal.Header >
                        <Modal.Title>Cadastro de Funcion??rio</Modal.Title>
                    </Modal.Header>
                    <Modal.Body>
                        <input type="hidden" value={id}
                            onChange={event => setId(Number(event.target.value))}></input>
                        <Row className="mb-3">
                            <Col>
                                <Form.Label>Nome</Form.Label>
                                <Form.Control placeholder="Nome" value={nome}
                                    onChange={event => setNome(event.target.value)} />
                            </Col>
                            <Col>
                                <Form.Label>Sobrenome</Form.Label>
                                <Form.Control placeholder="Sobrenome" value={sobrenome}
                                    onChange={event => setSobrenome(event.target.value)} />
                            </Col>
                        </Row>
                        <Row className="mb-3">
                            <Col>
                                <Form.Label>E-mail</Form.Label>
                                <Form.Control type="email" placeholder="E-mail" value={email}
                                    onChange={event => setEmail(event.target.value)} />
                            </Col>
                            <Col>
                                <Form.Label>N??mero Nis(PIS)</Form.Label>
                                <Form.Control placeholder="N??mero Nis (PIS)" value={numeroNis}
                                    onChange={event => setNumeroNis(event.target.value)} />
                            </Col>
                        </Row>
                    </Modal.Body>
                    <Modal.Footer>
                        <Button variant="secondary" onClick={handleClose}>
                            Cancelar
                        </Button>
                        <Button variant="primary" type="submit">
                            Salvar
                        </Button>
                    </Modal.Footer>
                </Form>
            </Modal>

        </>
    );
}