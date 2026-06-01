/**
 * MEU PRIMEIRO CURRÍCULO - APLICAÇÃO CLIENT-SIDE
 * Lógica de estado reativo, formulário multi-step, persistência e geração de PDF.
 */

document.addEventListener('DOMContentLoaded', () => {
    
    // ==========================================================================
    // ESTADO GLOBAL DA APLICAÇÃO (DADOS DO CURRÍCULO)
    // ==========================================================================
    let cvData = {
        nome: '',
        email: '',
        telefone: '',
        cidade: '',
        estado: '',
        linkedin: '',
        objetivo: '',
        incluirFoto: false,
        fotoBase64: '',
        formacoes: [],
        experiencias: [],
        habilidades: [],
        cursos: [],
        idiomas: []
    };

    let currentStep = 1;
    const totalSteps = 5;

    // ==========================================================================
    // ELEMENTOS DO DOM
    // ==========================================================================
    const form = document.getElementById('cv-form');
    const stepContents = document.querySelectorAll('.step-content');
    const stepNodes = document.querySelectorAll('.step-node');
    const progressBar = document.getElementById('stepper-progress-bar');
    
    // Botões de Ação do Form
    const btnPrev = document.getElementById('btn-prev');
    const btnNext = document.getElementById('btn-next');
    const btnClearAll = document.getElementById('btn-clear-all');
    const btnDownloadPdf = document.getElementById('btn-download-pdf');
    const btnPrintNative = document.getElementById('btn-print-native'); // Novo botão nativo
    
    // Foto
    const togglePhoto = document.getElementById('toggle-photo');
    const uploadZone = document.getElementById('upload-zone');
    const inputFoto = document.getElementById('input-foto');
    const photoPreviewContainer = document.getElementById('photo-preview-container');
    const imgProfilePreview = document.getElementById('img-profile-preview');
    const btnRemovePhoto = document.getElementById('btn-remove-photo');
    
    // Dinâmicos (Formulário)
    const listFormacao = document.getElementById('list-formacao');
    const btnAddFormacao = document.getElementById('btn-add-formacao');
    const listExperiencia = document.getElementById('list-experiencia');
    const btnAddExperiencia = document.getElementById('btn-add-experiencia');
    const listCursos = document.getElementById('list-cursos');
    const btnAddCurso = document.getElementById('btn-add-curso');
    const listIdiomas = document.getElementById('list-idiomas');
    const btnAddIdioma = document.getElementById('btn-add-idioma');
    
    // Habilidades
    const inputCustomSkill = document.getElementById('input-custom-skill');
    const btnAddCustomSkill = document.getElementById('btn-add-custom-skill');
    const skillsSelectedList = document.getElementById('skills-selected-list');
    const skillsEmptyText = document.getElementById('skills-empty-text');
    const tagBadges = document.querySelectorAll('.tag-badge-select');
    
    // Mobile View Toggle
    const btnToggleView = document.getElementById('btn-toggle-view');
    const previewPanel = document.getElementById('preview-panel');
    const toggleViewIcon = document.getElementById('toggle-view-icon');
    const toggleViewText = document.getElementById('toggle-view-text');

    // Elementos de Render no Preview A4
    const rNome = document.getElementById('render-nome');
    const rLocalizacao = document.getElementById('render-localizacao');
    const rTelefone = document.getElementById('render-telefone');
    const rEmail = document.getElementById('render-email');
    const rLinkedin = document.getElementById('render-linkedin');
    const rLinkedinContainer = document.getElementById('render-linkedin-container');
    const rObjetivo = document.getElementById('render-objetivo');
    const rPhotoContainer = document.getElementById('render-photo-container');
    const rImgProfile = document.getElementById('render-img-profile');
    
    // Seções de Render
    const rSecFormacao = document.getElementById('render-sec-formacao');
    const rFormacoesList = document.getElementById('render-formacoes-list');
    const rSecExperiencia = document.getElementById('render-sec-experiencia');
    const rExperienciasList = document.getElementById('render-experiencias-list');
    const rSecHabilidades = document.getElementById('render-sec-habilidades');
    const rSkillsList = document.getElementById('render-skills-list');
    const rSecCursos = document.getElementById('render-sec-cursos');
    const rCursosList = document.getElementById('render-cursos-list');
    const rSecIdiomas = document.getElementById('render-sec-idiomas');
    const rIdiomasList = document.getElementById('render-idiomas-list');

    // ==========================================================================
    // MÁSCARAS E VALIDAÇÃO DE ENTRADA
    // ==========================================================================
    
    // Máscara automática de telefone: (XX) XXXXX-XXXX ou (XX) XXXX-XXXX
    const maskPhone = (value) => {
        if (!value) return "";
        value = value.replace(/\D/g, "");
        value = value.replace(/(\d{2})(\d)/, "($1) $2");
        value = value.replace(/(\d{5})(\d)/, "$1-$2");
        return value.substring(0, 15);
    };

    const inputPhone = document.getElementById('input-telefone');
    inputPhone.addEventListener('input', (e) => {
        e.target.value = maskPhone(e.target.value);
        cvData.telefone = e.target.value;
        updatePreview();
        saveLocalStorage();
    });

    // ==========================================================================
    // SISTEMA DE PASSOS (STEPPER MULTI-STEP)
    // ==========================================================================
    
    const updateStepperUI = () => {
        const progressPercentage = ((currentStep - 1) / (totalSteps - 1)) * 100;
        progressBar.style.width = `${progressPercentage}%`;

        stepNodes.forEach(node => {
            const stepNum = parseInt(node.getAttribute('data-step'));
            node.classList.remove('active', 'completed');
            
            if (stepNum === currentStep) {
                node.classList.add('active');
            } else if (stepNum < currentStep) {
                node.classList.add('completed');
            }
        });

        stepContents.forEach(content => {
            content.classList.remove('active');
            if (parseInt(content.getAttribute('data-step')) === currentStep) {
                content.classList.add('active');
            }
        });

        if (currentStep === 1) {
            btnPrev.classList.add('disabled');
        } else {
            btnPrev.classList.remove('disabled');
        }

        if (currentStep === totalSteps) {
            btnNext.innerHTML = `
                Concluir & Ver 
                <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><polyline points="20 6 9 17 4 12"></polyline></svg>
            `;
            btnNext.classList.remove('btn-primary');
            btnNext.classList.add('btn-success');
        } else {
            btnNext.innerHTML = `
                Avançar
                <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><line x1="5" y1="12" x2="19" y2="12"></line><polyline points="12 5 19 12 12 19"></polyline></svg>
            `;
            btnNext.classList.remove('btn-success');
            btnNext.classList.add('btn-primary');
        }
        
        document.querySelector('.form-panel').scrollTop = 0;
    };

    const validateStep = (step) => {
        let isValid = true;
        const currentContainer = document.querySelector(`.step-content[data-step="${step}"]`);
        
        const requiredElements = currentContainer.querySelectorAll('[required]');
        
        requiredElements.forEach(element => {
            const formGroup = element.closest('.form-group');
            
            if (element.id === 'input-telefone') {
                const phoneDigits = element.value.replace(/\D/g, "");
                if (phoneDigits.length < 10) {
                    isValid = false;
                    formGroup.classList.add('has-error');
                } else {
                    formGroup.classList.remove('has-error');
                }
            } 
            else if (element.type === 'email') {
                const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
                if (!emailRegex.test(element.value)) {
                    isValid = false;
                    formGroup.classList.add('has-error');
                } else {
                    formGroup.classList.remove('has-error');
                }
            } 
            else if (!element.value.trim()) {
                isValid = false;
                formGroup.classList.add('has-error');
            } else {
                formGroup.classList.remove('has-error');
            }
        });

        if (step === 3 && cvData.formacoes.length > 0) {
            cvData.formacoes.forEach(formacao => {
                const itemContainer = document.querySelector(`[data-id="${formacao.id}"]`);
                if (itemContainer) {
                    const inputs = itemContainer.querySelectorAll('[required]');
                    inputs.forEach(input => {
                        if (!input.value.trim()) {
                            isValid = false;
                            input.closest('.form-group').classList.add('has-error');
                        } else {
                            input.closest('.form-group').classList.remove('has-error');
                        }
                    });
                }
            });
        }

        if (step === 4 && cvData.experiencias.length > 0) {
            cvData.experiencias.forEach(exp => {
                const itemContainer = document.querySelector(`[data-id="${exp.id}"]`);
                if (itemContainer) {
                    const inputs = itemContainer.querySelectorAll('[required]');
                    inputs.forEach(input => {
                        if (!input.value.trim()) {
                            isValid = false;
                            input.closest('.form-group').classList.add('has-error');
                        } else {
                            input.closest('.form-group').classList.remove('has-error');
                        }
                    });
                }
            });
        }

        if (step === 5 && cvData.idiomas.length > 0) {
            cvData.idiomas.forEach(idioma => {
                const itemContainer = document.querySelector(`[data-id="${idioma.id}"]`);
                if (itemContainer) {
                    const inputNome = itemContainer.querySelector('.input-idioma-nome');
                    if (inputNome && !inputNome.value.trim()) {
                        isValid = false;
                        inputNome.closest('.form-group').classList.add('has-error');
                    } else if (inputNome) {
                        inputNome.closest('.form-group').classList.remove('has-error');
                    }
                    
                    const selectNivel = itemContainer.querySelector('.select-idioma-nivel');
                    if (selectNivel && !selectNivel.value) {
                        isValid = false;
                        selectNivel.closest('.form-group').classList.add('has-error');
                    } else if (selectNivel) {
                        selectNivel.closest('.form-group').classList.remove('has-error');
                    }
                }
            });
        }

        return isValid;
    };

    btnNext.addEventListener('click', () => {
        if (validateStep(currentStep)) {
            if (currentStep < totalSteps) {
                currentStep++;
                updateStepperUI();
            } else {
                if (window.innerWidth <= 991) {
                    toggleMobilePreview(true);
                } else {
                    document.getElementById('preview-panel').scrollIntoView({ behavior: 'smooth' });
                }
            }
        } else {
            if (navigator.vibrate) navigator.vibrate(100);
            
            const firstError = document.querySelector('.has-error input, .has-error select, .has-error textarea');
            if (firstError) {
                firstError.focus();
                firstError.scrollIntoView({ behavior: 'smooth', block: 'center' });
            }
        }
    });

    btnPrev.addEventListener('click', () => {
        if (currentStep > 1) {
            currentStep--;
            updateStepperUI();
        }
    });

    stepNodes.forEach(node => {
        node.addEventListener('click', () => {
            const targetStep = parseInt(node.getAttribute('data-step'));
            
            if (targetStep > currentStep) {
                if (!validateStep(currentStep)) return;
                
                for (let s = currentStep; s < targetStep; s++) {
                    if (!validateStep(s)) {
                        currentStep = s;
                        updateStepperUI();
                        return;
                    }
                }
            }
            
            currentStep = targetStep;
            updateStepperUI();
        });
    });

    form.addEventListener('input', (e) => {
        if (e.target.closest('.form-group')) {
            e.target.closest('.form-group').classList.remove('has-error');
        }
    });

    document.querySelectorAll('.btn-suggestion').forEach(btn => {
        btn.addEventListener('click', (e) => {
            const targetId = btn.getAttribute('data-target');
            const targetInput = document.getElementById(targetId);
            if (targetInput) {
                targetInput.value = btn.innerText.replace(/"/g, '');
                targetInput.closest('.form-group').classList.remove('has-error');
                
                const event = new Event('input', { bubbles: true });
                targetInput.dispatchEvent(event);
            }
        });
    });

    // ==========================================================================
    // CONTROLES DE IMAGEM E FOTO DE PERFIL
    // ==========================================================================
    
    const setPhotoState = (enabled) => {
        cvData.incluirFoto = enabled;
        togglePhoto.checked = enabled;
        
        if (enabled) {
            uploadZone.classList.remove('disabled');
            inputFoto.removeAttribute('disabled');
            rPhotoContainer.classList.remove('hidden');
        } else {
            uploadZone.classList.add('disabled');
            inputFoto.setAttribute('disabled', 'true');
            rPhotoContainer.classList.add('hidden');
        }
        updatePreview();
        saveLocalStorage();
    };

    togglePhoto.addEventListener('change', (e) => {
        setPhotoState(e.target.checked);
    });

    const handleImageUpload = (file) => {
        if (!file) return;

        if (file.size > 2 * 1024 * 1024) {
            alert('A imagem é muito grande! Escolha uma foto de até 2MB.');
            return;
        }

        const reader = new FileReader();
        reader.onload = (e) => {
            const base64Data = e.target.result;
            cvData.fotoBase64 = base64Data;
            
            imgProfilePreview.src = base64Data;
            photoPreviewContainer.classList.remove('hidden');
            document.querySelector('.upload-placeholder').classList.add('hidden');
            
            rImgProfile.src = base64Data;
            
            updatePreview();
            saveLocalStorage();
        };
        reader.readAsDataURL(file);
    };

    inputFoto.addEventListener('change', (e) => {
        const file = e.target.files[0];
        handleImageUpload(file);
    });

    uploadZone.addEventListener('dragover', (e) => {
        e.preventDefault();
        if (!cvData.incluirFoto) return;
        uploadZone.style.borderColor = 'var(--primary-color)';
        uploadZone.style.backgroundColor = 'var(--primary-light)';
    });

    uploadZone.addEventListener('dragleave', () => {
        if (!cvData.incluirFoto) return;
        uploadZone.style.borderColor = 'var(--border-color)';
        uploadZone.style.backgroundColor = 'var(--bg-card)';
    });

    uploadZone.addEventListener('drop', (e) => {
        e.preventDefault();
        if (!cvData.incluirFoto) return;
        uploadZone.style.borderColor = 'var(--border-color)';
        uploadZone.style.backgroundColor = 'var(--bg-card)';
        
        const file = e.dataTransfer.files[0];
        if (file && file.type.startsWith('image/')) {
            handleImageUpload(file);
        }
    });

    btnRemovePhoto.addEventListener('click', (e) => {
        e.stopPropagation();
        cvData.fotoBase64 = '';
        inputFoto.value = '';
        
        photoPreviewContainer.classList.add('hidden');
        document.querySelector('.upload-placeholder').classList.remove('hidden');
        imgProfilePreview.src = '';
        rImgProfile.src = '';
        
        updatePreview();
        saveLocalStorage();
    });

    // ==========================================================================
    // COMPONENTE DINÂMICO 1: FORMAÇÃO ACADÊMICA (MÁSCARA RESPONSIVA DUO)
    // ==========================================================================
    
    const createFormacaoNode = (id, data = {}) => {
        const item = document.createElement('div');
        item.className = 'dynamic-item';
        item.setAttribute('data-id', id);
        
        item.innerHTML = `
            <div class="dynamic-item-header">
                <span class="dynamic-item-title">Instituição / Escola</span>
                <button type="button" class="btn-remove-item" title="Remover esta formação">
                    <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><line x1="18" y1="6" x2="6" y2="18"></line><line x1="6" y1="6" x2="18" y2="18"></line></svg>
                </button>
            </div>
            <div class="form-grid">
                <div class="form-group col-span-2">
                    <label>Nome da Escola / Instituição <span class="required">*</span></label>
                    <input type="text" class="input-formacao-escola" placeholder="Ex: Escola Estadual Professor Silva" value="${data.escola || ''}" required>
                    <span class="error-msg">Informe a instituição de ensino.</span>
                </div>
                <div class="form-group">
                    <label>Curso ou Nível <span class="required">*</span></label>
                    <input type="text" class="input-formacao-curso" placeholder="Ex: Ensino Médio, Curso Técnico de Informática" value="${data.curso || ''}" required>
                    <span class="error-msg">Informe o curso ou nível.</span>
                </div>
                
                <div class="form-group">
                    <label>Período de Estudos</label>
                    <!-- Grid-Duo impede quebra estreita no mobile para datas -->
                    <div class="grid-duo">
                        <div class="form-group" style="gap: 4px;">
                            <label style="font-size: 11px; color: var(--text-muted);">Ano Início <span class="required">*</span></label>
                            <input type="text" class="input-formacao-inicio" placeholder="Ex: 2024" maxlength="4" value="${data.inicio || ''}" required>
                        </div>
                        <div class="form-group" style="gap: 4px;">
                            <label style="font-size: 11px; color: var(--text-muted);">Ano Fim <span class="required">*</span></label>
                            <input type="text" class="input-formacao-fim" placeholder="Ex: 2026" maxlength="15" value="${data.fim || ''}" required ${data.emAndamento ? 'disabled' : ''}>
                        </div>
                    </div>
                </div>
                
                <div class="form-group col-span-2">
                    <label class="checkbox-inline">
                        <input type="checkbox" class="input-formacao-andamento" ${data.emAndamento ? 'checked' : ''}>
                        Ainda estou estudando nesta instituição
                    </label>
                </div>
            </div>
        `;

        const btnRemove = item.querySelector('.btn-remove-item');
        btnRemove.addEventListener('click', () => {
            item.remove();
            cvData.formacoes = cvData.formacoes.filter(f => f.id !== id);
            updatePreview();
            saveLocalStorage();
        });

        const checkAndamento = item.querySelector('.input-formacao-andamento');
        const inputFim = item.querySelector('.input-formacao-fim');
        
        checkAndamento.addEventListener('change', (e) => {
            if (e.target.checked) {
                inputFim.value = 'Em andamento';
                inputFim.setAttribute('disabled', 'true');
                inputFim.closest('.form-group').classList.remove('has-error');
            } else {
                inputFim.value = '';
                inputFim.removeAttribute('disabled');
            }
            syncFormacaoData(id, item);
        });

        item.querySelectorAll('input').forEach(input => {
            input.addEventListener('input', () => {
                syncFormacaoData(id, item);
            });
        });

        return item;
    };

    const syncFormacaoData = (id, container) => {
        const escola = container.querySelector('.input-formacao-escola').value;
        const curso = container.querySelector('.input-formacao-curso').value;
        const inicio = container.querySelector('.input-formacao-inicio').value;
        const fim = container.querySelector('.input-formacao-fim').value;
        const emAndamento = container.querySelector('.input-formacao-andamento').checked;

        const index = cvData.formacoes.findIndex(f => f.id === id);
        const dataObj = { id, escola, curso, inicio, fim, emAndamento };

        if (index !== -1) {
            cvData.formacoes[index] = dataObj;
        } else {
            cvData.formacoes.push(dataObj);
        }
        
        updatePreview();
        saveLocalStorage();
    };

    btnAddFormacao.addEventListener('click', () => {
        const uniqueId = 'edu_' + Date.now();
        const node = createFormacaoNode(uniqueId);
        listFormacao.appendChild(node);
        cvData.formacoes.push({ id: uniqueId, escola: '', curso: '', inicio: '', fim: '', emAndamento: false });
        node.scrollIntoView({ behavior: 'smooth', block: 'center' });
    });

    // ==========================================================================
    // COMPONENTE DINÂMICO 2: EXPERIÊNCIAS PROFISSIONAIS OU INFORMAIS (MÁSCARA RESPONSIVA DUO)
    // ==========================================================================
    
    const createExperienciaNode = (id, data = {}) => {
        const item = document.createElement('div');
        item.className = 'dynamic-item';
        item.setAttribute('data-id', id);
        
        item.innerHTML = `
            <div class="dynamic-item-header">
                <span class="dynamic-item-title">Experiência / Projeto</span>
                <button type="button" class="btn-remove-item" title="Remover esta experiência">
                    <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><line x1="18" y1="6" x2="6" y2="18"></line><line x1="6" y1="6" x2="18" y2="18"></line></svg>
                </button>
            </div>
            <div class="form-grid">
                <div class="form-group">
                    <label>Cargo ou Função <span class="required">*</span></label>
                    <input type="text" class="input-exp-cargo" placeholder="Ex: Ajudante Geral, Voluntário" value="${data.cargo || ''}" required>
                    <span class="error-msg">Informe a função exercida.</span>
                </div>
                <div class="form-group">
                    <label>Local / Empresa / Projeto <span class="required">*</span></label>
                    <input type="text" class="input-exp-empresa" placeholder="Ex: Padaria do Bairro" value="${data.empresa || ''}" required>
                    <span class="error-msg">Informe o local ou empresa.</span>
                </div>
                
                <div class="form-group col-span-2">
                    <label>Período de Trabalho</label>
                    <!-- Grid-Duo impede quebra no mobile -->
                    <div class="grid-duo">
                        <div class="form-group" style="gap: 4px;">
                            <label style="font-size: 11px; color: var(--text-muted);">Ano Início <span class="required">*</span></label>
                            <input type="text" class="input-exp-inicio" placeholder="Ex: 2024" maxlength="4" value="${data.inicio || ''}" required>
                        </div>
                        <div class="form-group" style="gap: 4px;">
                            <label style="font-size: 11px; color: var(--text-muted);">Ano Fim <span class="required">*</span></label>
                            <input type="text" class="input-exp-fim" placeholder="Ex: 2025" maxlength="15" value="${data.fim || ''}" required ${data.atual ? 'disabled' : ''}>
                        </div>
                    </div>
                </div>
                
                <div class="form-group col-span-2">
                    <label class="checkbox-inline">
                        <input type="checkbox" class="input-exp-atual" ${data.atual ? 'checked' : ''}>
                        Ainda atuo nesta função/empresa
                    </label>
                </div>
                <div class="form-group col-span-2">
                    <label>Resumo das Atividades <span class="required">*</span></label>
                    <textarea class="input-exp-desc" rows="3" placeholder="O que você fazia lá? (Ex: Atendimento ao cliente, auxílio no controle de caixa, organização das mercadorias)." required>${data.desc || ''}</textarea>
                    <span class="error-msg">Por favor, faça um resumo rápido do que você fazia.</span>
                </div>
            </div>
        `;

        const btnRemove = item.querySelector('.btn-remove-item');
        btnRemove.addEventListener('click', () => {
            item.remove();
            cvData.experiencias = cvData.experiencias.filter(e => e.id !== id);
            updatePreview();
            saveLocalStorage();
        });

        const checkAtual = item.querySelector('.input-exp-atual');
        const inputFim = item.querySelector('.input-exp-fim');
        
        checkAtual.addEventListener('change', (e) => {
            if (e.target.checked) {
                inputFim.value = 'Atualmente';
                inputFim.setAttribute('disabled', 'true');
                inputFim.closest('.form-group').classList.remove('has-error');
            } else {
                inputFim.value = '';
                inputFim.removeAttribute('disabled');
            }
            syncExperienciaData(id, item);
        });

        item.querySelectorAll('input, textarea').forEach(el => {
            el.addEventListener('input', () => {
                syncExperienciaData(id, item);
            });
        });

        return item;
    };

    const syncExperienciaData = (id, container) => {
        const cargo = container.querySelector('.input-exp-cargo').value;
        const empresa = container.querySelector('.input-exp-empresa').value;
        const inicio = container.querySelector('.input-exp-inicio').value;
        const fim = container.querySelector('.input-exp-fim').value;
        const atual = container.querySelector('.input-exp-atual').checked;
        const desc = container.querySelector('.input-exp-desc').value;

        const index = cvData.experiencias.findIndex(e => e.id === id);
        const dataObj = { id, cargo, empresa, inicio, fim, atual, desc };

        if (index !== -1) {
            cvData.experiencias[index] = dataObj;
        } else {
            cvData.experiencias.push(dataObj);
        }
        
        updatePreview();
        saveLocalStorage();
    };

    btnAddExperiencia.addEventListener('click', () => {
        const uniqueId = 'exp_' + Date.now();
        const node = createExperienciaNode(uniqueId);
        listExperiencia.appendChild(node);
        cvData.experiencias.push({ id: uniqueId, cargo: '', empresa: '', inicio: '', fim: '', atual: false, desc: '' });
        node.scrollIntoView({ behavior: 'smooth', block: 'center' });
    });

    // ==========================================================================
    // COMPONENTE DINÂMICO 3: CURSOS ADICIONAIS & CERTIFICAÇÕES (MÁSCARA CORRIGIDA)
    // ==========================================================================
    
    const createCursoNode = (id, data = {}) => {
        const item = document.createElement('div');
        item.className = 'dynamic-item';
        item.setAttribute('data-id', id);
        
        // CORREÇÃO UX/UI: Remove sub-grids internos redundantes.
        // O Nome do curso ganha largura completa, e a Escola e Carga ficam como itens normais,
        // garantindo empilhamento limpo no celular sem espremer em "pedacinhos".
        item.innerHTML = `
            <div class="dynamic-item-header">
                <span class="dynamic-item-title">Curso / Palestra</span>
                <button type="button" class="btn-remove-item" title="Remover curso">
                    <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><line x1="18" y1="6" x2="6" y2="18"></line><line x1="6" y1="6" x2="18" y2="18"></line></svg>
                </button>
            </div>
            <div class="form-grid">
                <div class="form-group col-span-2">
                    <label>Nome do Curso / Certificado <span class="required">*</span></label>
                    <input type="text" class="input-curso-nome" placeholder="Ex: Informática Básica, Atendimento" value="${data.nome || ''}" required>
                    <span class="error-msg">Informe o nome do curso ou palestra.</span>
                </div>
                <div class="form-group">
                    <label>Instituição Realizadora <span class="required">*</span></label>
                    <input type="text" class="input-curso-escola" placeholder="Ex: Fundação Bradesco, SEBRAE" value="${data.escola || ''}" required>
                    <span class="error-msg">Informe a escola realizadora.</span>
                </div>
                <div class="form-group">
                    <label>Carga Horária / Ano <span class="optional">(Opcional)</span></label>
                    <input type="text" class="input-curso-carga" placeholder="Ex: 40 horas / 2025" value="${data.carga || ''}">
                </div>
            </div>
        `;

        const btnRemove = item.querySelector('.btn-remove-item');
        btnRemove.addEventListener('click', () => {
            item.remove();
            cvData.cursos = cvData.cursos.filter(c => c.id !== id);
            updatePreview();
            saveLocalStorage();
        });

        item.querySelectorAll('input').forEach(input => {
            input.addEventListener('input', () => {
                syncCursoData(id, item);
            });
        });

        return item;
    };

    const syncCursoData = (id, container) => {
        const nome = container.querySelector('.input-curso-nome').value;
        const school = container.querySelector('.input-curso-escola').value;
        const carga = container.querySelector('.input-curso-carga').value;

        const index = cvData.cursos.findIndex(c => c.id === id);
        const dataObj = { id, nome, escola: school, carga };

        if (index !== -1) {
            cvData.cursos[index] = dataObj;
        } else {
            cvData.cursos.push(dataObj);
        }
        
        updatePreview();
        saveLocalStorage();
    };

    btnAddCurso.addEventListener('click', () => {
        const uniqueId = 'cur_' + Date.now();
        const node = createCursoNode(uniqueId);
        listCursos.appendChild(node);
        cvData.cursos.push({ id: uniqueId, nome: '', escola: '', carga: '' });
        node.scrollIntoView({ behavior: 'smooth', block: 'center' });
    });

    // ==========================================================================
    // COMPONENTE DINÂMICO 4: IDIOMAS (NOVO REQUISITO)
    // ==========================================================================
    
    const createIdiomaNode = (id, data = {}) => {
        const item = document.createElement('div');
        item.className = 'dynamic-item';
        item.setAttribute('data-id', id);
        
        item.innerHTML = `
            <div class="dynamic-item-header">
                <span class="dynamic-item-title">Idioma Falado</span>
                <button type="button" class="btn-remove-item" title="Remover idioma">
                    <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><line x1="18" y1="6" x2="6" y2="18"></line><line x1="6" y1="6" x2="18" y2="18"></line></svg>
                </button>
            </div>
            <div class="form-grid">
                <div class="form-group">
                    <label>Idioma <span class="required">*</span></label>
                    <input type="text" class="input-idioma-nome" placeholder="Ex: Inglês, Espanhol, Libras" value="${data.nome || ''}" required>
                    <span class="error-msg">Informe o idioma.</span>
                </div>
                <div class="form-group">
                    <label>Proficiência / Nível <span class="required">*</span></label>
                    <select class="select-idioma-nivel" required>
                        <option value="" disabled ${!data.nivel ? 'selected' : ''}>Selecione seu nível</option>
                        <option value="Básico" ${data.nivel === 'Básico' ? 'selected' : ''}>Básico (entende frases simples)</option>
                        <option value="Intermediário" ${data.nivel === 'Intermediário' ? 'selected' : ''}>Intermediário (consegue conversar um pouco)</option>
                        <option value="Avançado" ${data.nivel === 'Avançado' ? 'selected' : ''}>Avançado (conversa bem e lê sem problemas)</option>
                        <option value="Fluente ou Nativo" ${data.nivel === 'Fluente ou Nativo' ? 'selected' : ''}>Fluente / Nativo</option>
                    </select>
                    <span class="error-msg">Selecione o seu nível.</span>
                </div>
            </div>
        `;

        const btnRemove = item.querySelector('.btn-remove-item');
        btnRemove.addEventListener('click', () => {
            item.remove();
            cvData.idiomas = cvData.idiomas.filter(i => i.id !== id);
            updatePreview();
            saveLocalStorage();
        });

        item.querySelector('.input-idioma-nome').addEventListener('input', () => {
            syncIdiomaData(id, item);
        });
        
        item.querySelector('.select-idioma-nivel').addEventListener('change', () => {
            syncIdiomaData(id, item);
        });

        return item;
    };

    const syncIdiomaData = (id, container) => {
        const nome = container.querySelector('.input-idioma-nome').value;
        const nivel = container.querySelector('.select-idioma-nivel').value;

        const index = cvData.idiomas.findIndex(i => i.id === id);
        const dataObj = { id, nome, nivel };

        if (index !== -1) {
            cvData.idiomas[index] = dataObj;
        } else {
            cvData.idiomas.push(dataObj);
        }
        
        updatePreview();
        saveLocalStorage();
    };

    btnAddIdioma.addEventListener('click', () => {
        const uniqueId = 'lan_' + Date.now();
        const node = createIdiomaNode(uniqueId);
        listIdiomas.appendChild(node);
        cvData.idiomas.push({ id: uniqueId, nome: '', nivel: '' });
        node.scrollIntoView({ behavior: 'smooth', block: 'center' });
    });

    // ==========================================================================
    // COMPONENTE: SISTEMA DE TAGS DE HABILIDADES
    // ==========================================================================
    
    tagBadges.forEach(badge => {
        badge.addEventListener('click', () => {
            const skillName = badge.getAttribute('data-skill');
            
            if (cvData.habilidades.includes(skillName)) {
                cvData.habilidades = cvData.habilidades.filter(h => h !== skillName);
                badge.classList.remove('selected');
            } else {
                cvData.habilidades.push(skillName);
                badge.classList.add('selected');
            }
            
            renderHabilidadesTags();
            updatePreview();
            saveLocalStorage();
        });
    });

    const addCustomSkill = () => {
        const customSkill = inputCustomSkill.value.trim();
        if (customSkill) {
            if (!cvData.habilidades.includes(customSkill)) {
                cvData.habilidades.push(customSkill);
                
                tagBadges.forEach(badge => {
                    if (badge.getAttribute('data-skill').toLowerCase() === customSkill.toLowerCase()) {
                        badge.classList.add('selected');
                    }
                });

                renderHabilidadesTags();
                updatePreview();
                saveLocalStorage();
            }
            inputCustomSkill.value = '';
            inputCustomSkill.focus();
        }
    };

    btnAddCustomSkill.addEventListener('click', addCustomSkill);
    inputCustomSkill.addEventListener('keypress', (e) => {
        if (e.key === 'Enter') {
            e.preventDefault();
            addCustomSkill();
        }
    });

    const renderHabilidadesTags = () => {
        skillsSelectedList.querySelectorAll('.skill-tag-active').forEach(tag => tag.remove());
        
        if (cvData.habilidades.length === 0) {
            skillsEmptyText.classList.remove('hidden');
        } else {
            skillsEmptyText.classList.add('hidden');
            
            cvData.habilidades.forEach(skill => {
                const tag = document.createElement('span');
                tag.className = 'skill-tag-active';
                tag.innerHTML = `
                    ${skill}
                    <button type="button" class="btn-remove-tag" title="Remover">×</button>
                `;
                
                tag.querySelector('.btn-remove-tag').addEventListener('click', () => {
                    cvData.habilidades = cvData.habilidades.filter(h => h !== skill);
                    
                    tagBadges.forEach(badge => {
                        if (badge.getAttribute('data-skill') === skill) {
                            badge.classList.remove('selected');
                        }
                    });
                    
                    tag.remove();
                    if (cvData.habilidades.length === 0) {
                        skillsEmptyText.classList.remove('hidden');
                    }
                    updatePreview();
                    saveLocalStorage();
                });
                
                skillsSelectedList.appendChild(tag);
            });
        }
    };

    // ==========================================================================
    // SINCRONIZAÇÃO EM TEMPO REAL COM O PREVIEW DO CURRÍCULO (A4)
    // ==========================================================================
    
    const updatePreview = () => {
        rNome.innerText = cvData.nome || 'Seu Nome Completo';
        
        if (cvData.cidade || cvData.estado) {
            rLocalizacao.innerText = `${cvData.cidade || 'Cidade'}${cvData.estado ? ', ' + cvData.estado : ''}`;
            rLocalizacao.classList.remove('hidden');
        } else {
            rLocalizacao.innerText = 'Cidade, Estado';
        }
        
        rTelefone.innerText = cvData.telefone || 'Telefone / WhatsApp';
        rEmail.innerText = cvData.email || 'seu.email@provedor.com';
        
        if (cvData.linkedin) {
            rLinkedin.innerText = cvData.linkedin.replace(/^(https?:\/\/)?(www\.)?/, "");
            rLinkedinContainer.classList.remove('hidden');
        } else {
            rLinkedinContainer.classList.add('hidden');
        }

        rObjetivo.innerText = cvData.objetivo || 'Escreva seu objetivo profissional de forma curta. Escolha uma das nossas dicas de redação rápida para se inspirar e iniciar!';

        if (cvData.incluirFoto && cvData.fotoBase64) {
            rImgProfile.src = cvData.fotoBase64;
            rPhotoContainer.classList.remove('hidden');
        } else {
            rPhotoContainer.classList.add('hidden');
        }

        rFormacoesList.innerHTML = '';
        const formacoesValidas = cvData.formacoes.filter(f => f.escola.trim() || f.curso.trim());
        
        if (formacoesValidas.length > 0) {
            rSecFormacao.classList.remove('hidden');
            formacoesValidas.forEach(f => {
                const item = document.createElement('div');
                item.className = 'cv-item';
                
                let periodo = '';
                if (f.inicio) {
                    periodo = f.inicio;
                    if (f.emAndamento) {
                        periodo += ' - Em andamento';
                    } else if (f.fim) {
                        periodo += ` - ${f.fim}`;
                    }
                }
                
                item.innerHTML = `
                    <div class="cv-item-header">
                        <span class="cv-item-title">${f.curso || 'Curso/Nível'}</span>
                        <span class="cv-item-period">${periodo}</span>
                    </div>
                    <span class="cv-item-subtitle">${f.escola || 'Instituição'}</span>
                `;
                rFormacoesList.appendChild(item);
            });
        } else {
            rSecFormacao.classList.add('hidden');
        }

        rExperienciasList.innerHTML = '';
        const experienciasValidas = cvData.experiencias.filter(e => e.cargo.trim() || e.empresa.trim());
        
        if (experienciasValidas.length > 0) {
            rSecExperiencia.classList.remove('hidden');
            experienciasValidas.forEach(e => {
                const item = document.createElement('div');
                item.className = 'cv-item';
                
                let periodo = '';
                if (e.inicio) {
                    periodo = e.inicio;
                    if (e.atual) {
                        periodo += ' - Atualmente';
                    } else if (e.fim) {
                        periodo += ` - ${e.fim}`;
                    }
                }
                
                item.innerHTML = `
                    <div class="cv-item-header">
                        <span class="cv-item-title">${e.cargo || 'Cargo/Função'}</span>
                        <span class="cv-item-period">${periodo}</span>
                    </div>
                    <span class="cv-item-subtitle">${e.empresa || 'Empresa/Organização'}</span>
                    ${e.desc ? `<p class="cv-item-desc">${e.desc.replace(/\n/g, '<br>')}</p>` : ''}
                `;
                rExperienciasList.appendChild(item);
            });
        } else {
            rSecExperiencia.classList.add('hidden');
        }

        rSkillsList.innerHTML = '';
        if (cvData.habilidades.length > 0) {
            rSecHabilidades.classList.remove('hidden');
            cvData.habilidades.forEach(skill => {
                const tag = document.createElement('span');
                tag.className = 'cv-skill-tag';
                tag.innerText = skill;
                rSkillsList.appendChild(tag);
            });
        } else {
            rSecHabilidades.classList.add('hidden');
        }

        rCursosList.innerHTML = '';
        const cursosValidos = cvData.cursos.filter(c => c.nome.trim() || c.escola.trim());
        
        if (cursosValidos.length > 0) {
            rSecCursos.classList.remove('hidden');
            cursosValidos.forEach(c => {
                const item = document.createElement('div');
                item.className = 'cv-item';
                item.innerHTML = `
                    <div class="cv-item-header">
                        <span class="cv-item-title">${c.nome || 'Nome do Curso'}</span>
                        <span class="cv-item-period">${c.carga || ''}</span>
                    </div>
                    <span class="cv-item-subtitle">${c.escola || 'Instituição/Plataforma'}</span>
                `;
                rCursosList.appendChild(item);
            });
        } else {
            rSecCursos.classList.add('hidden');
        }

        rIdiomasList.innerHTML = '';
        const idiomasValidos = cvData.idiomas.filter(i => i.nome.trim() && i.nivel);
        
        if (idiomasValidos.length > 0) {
            rSecIdiomas.classList.remove('hidden');
            idiomasValidos.forEach(i => {
                const tag = document.createElement('span');
                tag.className = 'cv-skill-tag';
                tag.innerText = `${i.nome} (${i.nivel})`;
                rIdiomasList.appendChild(tag);
            });
        } else {
            rSecIdiomas.classList.add('hidden');
        }
    };

    const staticInputs = [
        { id: 'input-nome', prop: 'nome' },
        { id: 'input-email', prop: 'email' },
        { id: 'input-cidade', prop: 'cidade' },
        { id: 'input-estado', prop: 'estado' },
        { id: 'input-linkedin', prop: 'linkedin' },
        { id: 'input-objetivo', prop: 'objetivo' }
    ];

    staticInputs.forEach(mapping => {
        const input = document.getElementById(mapping.id);
        if (input) {
            input.addEventListener('input', (e) => {
                cvData[mapping.prop] = e.target.value;
                updatePreview();
                saveLocalStorage();
            });
        }
    });

    // ==========================================================================
    // PERSISTÊNCIA LOCAL COM BLINDAGEM CONTRA DADOS ANTIGOS (RETROCOMPATIBILIDADE)
    // ==========================================================================
    
    const saveLocalStorage = () => {
        localStorage.setItem('cv_builder_jovem_data', JSON.stringify(cvData));
    };

    const loadLocalStorage = () => {
        const storedData = localStorage.getItem('cv_builder_jovem_data');
        if (storedData) {
            try {
                const data = JSON.parse(storedData);
                
                // 🛡️ SEGURANÇA DE RETROCOMPATIBILIDADE:
                // Previne que dados parciais antigos vindos de cookies do navegador
                // subscrevam e destruam como 'undefined' os arrays dinâmicos novos (idiomas).
                cvData = {
                    nome: '', email: '', telefone: '', cidade: '', estado: '', linkedin: '', objetivo: '',
                    incluirFoto: false, fotoBase64: '', formacoes: [], experiencias: [], habilidades: [], cursos: [], idiomas: [],
                    ...data
                };
                
                if (!cvData.formacoes) cvData.formacoes = [];
                if (!cvData.experiencias) cvData.experiencias = [];
                if (!cvData.habilidades) cvData.habilidades = [];
                if (!cvData.cursos) cvData.cursos = [];
                if (!cvData.idiomas) cvData.idiomas = [];

                staticInputs.forEach(mapping => {
                    const input = document.getElementById(mapping.id);
                    if (input && cvData[mapping.prop]) {
                        input.value = cvData[mapping.prop];
                    }
                });

                if (cvData.telefone) {
                    inputPhone.value = cvData.telefone;
                }

                if (cvData.incluirFoto) {
                    setPhotoState(true);
                    if (cvData.fotoBase64) {
                        imgProfilePreview.src = cvData.fotoBase64;
                        photoPreviewContainer.classList.remove('hidden');
                        document.querySelector('.upload-placeholder').classList.add('hidden');
                        rImgProfile.src = cvData.fotoBase64;
                    }
                } else {
                    setPhotoState(false);
                }

                listFormacao.innerHTML = '';
                cvData.formacoes.forEach(f => {
                    const node = createFormacaoNode(f.id, f);
                    listFormacao.appendChild(node);
                });

                listExperiencia.innerHTML = '';
                cvData.experiencias.forEach(e => {
                    const node = createExperienciaNode(e.id, e);
                    listExperiencia.appendChild(node);
                });

                listCursos.innerHTML = '';
                cvData.cursos.forEach(c => {
                    const node = createCursoNode(c.id, c);
                    listCursos.appendChild(node);
                });

                listIdiomas.innerHTML = '';
                cvData.idiomas.forEach(i => {
                    const node = createIdiomaNode(i.id, i);
                    listIdiomas.appendChild(node);
                });

                tagBadges.forEach(badge => {
                    const skill = badge.getAttribute('data-skill');
                    if (cvData.habilidades.includes(skill)) {
                        badge.classList.add('selected');
                    }
                });
                renderHabilidadesTags();
                
                updatePreview();

            } catch (err) {
                console.error("Erro ao ler dados salvos no navegador:", err);
            }
        }
    };

    btnClearAll.addEventListener('click', () => {
        if (confirm("Você quer mesmo apagar tudo o que preencheu? Seu currículo será esvaziado no navegador.")) {
            localStorage.removeItem('cv_builder_jovem_data');
            window.location.reload();
        }
    });

    // ==========================================================================
    // ALTERNAR VISUALIZAÇÃO MOBILE (ABERTURA DO PREVIEW)
    // ==========================================================================
    
    const toggleMobilePreview = (show) => {
        if (show) {
            previewPanel.classList.add('mobile-visible');
            toggleViewIcon.innerText = '✏️';
            toggleViewText.innerText = 'Editar Dados';
            btnToggleView.style.backgroundColor = 'var(--secondary-color)';
        } else {
            previewPanel.classList.remove('mobile-visible');
            toggleViewIcon.innerText = '👁️';
            toggleViewText.innerText = 'Ver Currículo';
            btnToggleView.style.backgroundColor = 'var(--primary-color)';
        }
    };

    btnToggleView.addEventListener('click', () => {
        const isVisible = previewPanel.classList.contains('mobile-visible');
        toggleMobilePreview(!isVisible);
    });

    // ==========================================================================
    // EXPORTAÇÃO E DOWNLOAD DO PDF COM HTML2PDF.JS (CORRIGIDO PARA GITHUB PAGES / SAFARI)
    // ==========================================================================
    
    // Conecta o evento ao botão alternativo nativo (Imprimir / Salvar)
    btnPrintNative.addEventListener('click', () => {
        window.print();
    });

    btnDownloadPdf.addEventListener('click', () => {
        if (!cvData.nome.trim()) {
            alert("Escreva pelo menos o seu Nome Completo para baixar o currículo.");
            currentStep = 1;
            updateStepperUI();
            toggleMobilePreview(false);
            document.getElementById('input-nome').focus();
            return;
        }

        const originalContent = btnDownloadPdf.innerHTML;
        btnDownloadPdf.innerHTML = `
            <svg class="spinner" width="20" height="20" viewBox="0 0 50 50" style="margin-right: 8px; animation: spin 1s linear infinite;"><circle class="path" cx="25" cy="25" r="20" fill="none" stroke="currentColor" stroke-width="5" stroke-linecap="round"></circle></svg>
            Gerando...
        `;
        btnDownloadPdf.setAttribute('disabled', 'true');
        btnDownloadPdf.style.opacity = '0.85';

        // Timer de segurança de fallback
        const printFallbackTimeout = setTimeout(() => {
            if (confirm("A geração em lote do PDF pelo navegador está demorando. Deseja abrir a tela de salvamento/impressão nativa que é instantânea? (Basta selecionar 'Salvar como PDF' na tela).")) {
                window.print();
            }
            btnDownloadPdf.innerHTML = originalContent;
            btnDownloadPdf.removeAttribute('disabled');
            btnDownloadPdf.style.opacity = '1';
        }, 6000);

        // 🚀 CORREÇÃO CRÍTICA DO TRAVAMENTO DO PDF NO GITHUB PAGES:
        // Colocar elementos em left: -9999px impede que o Chrome e Safari móveis os renderizem no viewport ativo,
        // fazendo com que o html2canvas e o gerador de imagem da biblioteca entrem em estado de congelamento.
        // Solução: Anexar o clone com position: fixed, opacity: 0.01 (invisível ao olho) e z-index: -9999 (por baixo de tudo).
        // Isso força a renderização gráfica ativa na GPU do celular, liberando o processo instantaneamente!
        
        const originalElement = document.getElementById('cv-target-render');
        
        const cloneWrapper = document.createElement('div');
        cloneWrapper.id = 'cv-print-clone-wrapper';
        cloneWrapper.style.position = 'fixed';
        cloneWrapper.style.left = '0';
        cloneWrapper.style.top = '0';
        cloneWrapper.style.width = '210mm'; // Largura física A4 exata
        cloneWrapper.style.backgroundColor = '#ffffff';
        cloneWrapper.style.margin = '0';
        cloneWrapper.style.padding = '0';
        cloneWrapper.style.boxSizing = 'border-box';
        cloneWrapper.style.opacity = '0.01'; // Quase invisível
        cloneWrapper.style.zIndex = '-9999'; // Fica atrás de absolutamente tudo
        cloneWrapper.style.pointerEvents = 'none'; // Impede interceptação de cliques do usuário
        
        const clonedElement = originalElement.cloneNode(true);
        clonedElement.style.width = '210mm';
        clonedElement.style.padding = '35px'; // Margem regulada para o PDF
        clonedElement.style.boxSizing = 'border-box';
        clonedElement.style.display = 'block';
        
        const clonedImages = clonedElement.querySelectorAll('img');
        clonedImages.forEach(img => {
            img.setAttribute('crossorigin', 'anonymous');
        });
        
        cloneWrapper.appendChild(clonedElement);
        document.body.appendChild(cloneWrapper);

        const cleanName = cvData.nome.normalize("NFD").replace(/[\u0300-\u036f]/g, "").replace(/\s+/g, "_");
        const filename = `Curriculo_${cleanName || 'Meu_Primeiro_Emprego'}.pdf`;

        const opt = {
            margin:       0,
            filename:     filename,
            image:        { type: 'jpeg', quality: 0.98 },
            html2canvas:  { 
                scale: 2, 
                useCORS: true, 
                letterRendering: true,
                dpi: 150,
                scrollX: 0,
                scrollY: 0,
                backgroundColor: '#ffffff'
            },
            jsPDF:        { unit: 'mm', format: 'a4', orientation: 'portrait' }
        };

        // Roda o html2pdf.js com tratamento de promessa
        html2pdf().set(opt).from(cloneWrapper).save().then(() => {
            clearTimeout(printFallbackTimeout);
            cloneWrapper.remove();
            
            btnDownloadPdf.innerHTML = originalContent;
            btnDownloadPdf.removeAttribute('disabled');
            btnDownloadPdf.style.opacity = '1';
        }).catch(err => {
            console.error("Erro na geração do PDF:", err);
            clearTimeout(printFallbackTimeout);
            cloneWrapper.remove();
            
            if (confirm("Seu navegador impediu o download automático. Deseja usar o salvamento oficial do aparelho em PDF?")) {
                window.print();
            }
            
            btnDownloadPdf.innerHTML = originalContent;
            btnDownloadPdf.removeAttribute('disabled');
            btnDownloadPdf.style.opacity = '1';
        });
    });

    const style = document.createElement('style');
    style.innerHTML = `
        @keyframes spin {
            100% { transform: rotate(360deg); }
        }
        .spinner {
            display: inline-block;
        }
    `;
    document.head.appendChild(style);

    // ==========================================================================
    // BOOTSTRAP - INICIALIZAÇÃO DA PÁGINA
    // ==========================================================================
    loadLocalStorage();
    updateStepperUI();
});
