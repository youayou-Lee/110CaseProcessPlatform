# ���ñ���Ϊ GBK
[Console]::OutputEncoding = [System.Text.Encoding]::GetEncoding('gbk')
$OutputEncoding = [System.Text.Encoding]::GetEncoding('gbk')

# ���ô���ʱִֹͣ��
$ErrorActionPreference = "Stop"

# ������ɫ����
function Write-ColorOutput($ForegroundColor) {
    $fc = $host.UI.RawUI.ForegroundColor
    $host.UI.RawUI.ForegroundColor = $ForegroundColor
    if ($args) {
        Write-Output $args
    }
    else {
        $input | Write-Output
    }
    $host.UI.RawUI.ForegroundColor = $fc
}

# ����Ƿ�װ�˱�Ҫ�Ĺ���
function Check-Requirements {
    Write-ColorOutput Green "��黷��Ҫ��..."
    
    # ��� Node.js
    try {
        $nodeVersion = node --version
        Write-ColorOutput Green "Node.js �汾: $nodeVersion"
    }
    catch {
        Write-ColorOutput Red "����: δ��װ Node.js�����Ȱ�װ Node.js"
        exit 1
    }
      
    # ��� conda
    try {
        $condaVersion = conda --version
        Write-ColorOutput Green "Conda �汾: $condaVersion"
    }
    catch {
        Write-ColorOutput Red "����: δ��װ Conda�����Ȱ�װ Conda"
        exit 1
    }

    # ��� Python
    try {
        conda activate you
        $pythonVersion = python --version
        Write-ColorOutput Green "Python �汾: $pythonVersion"
    }
    catch {
        Write-ColorOutput Red "����: δ��װ Python�����Ȱ�װ Python"
        exit 1
    }
}

# ������˷���
function Start-Backend {
    Write-ColorOutput Green "����������˷���..."
    Set-Location backend
    
    # ���� conda ����
    Write-ColorOutput Yellow "���� conda ����..."
    conda activate you
    
    # ��װ����
    Write-ColorOutput Yellow "��װ�������..."
    pip install -r requirements.txt
    
    # ������˷���
    Write-ColorOutput Green "���� Flask ����..."
    Start-Process powershell -ArgumentList "-NoExit", "-Command", "[Console]::OutputEncoding = [System.Text.Encoding]::GetEncoding('gbk'); `$OutputEncoding = [System.Text.Encoding]::GetEncoding('gbk'); conda activate you; flask run"
    
    Set-Location ..
}

# ����ǰ�˷���
function Start-Frontend {
    Write-ColorOutput Green "��������ǰ�˷���..."
    Set-Location frontend
    
    # ��װ����
    Write-ColorOutput Yellow "��װǰ������..."
    npm install
    
    # ����ǰ�˷���
    Write-ColorOutput Green "���� React ����������..."
    Start-Process powershell -ArgumentList "-NoExit", "-Command", "[Console]::OutputEncoding = [System.Text.Encoding]::GetEncoding('gbk'); `$OutputEncoding = [System.Text.Encoding]::GetEncoding('gbk'); npm start"
    
    Set-Location ..
}

# ������
function Main {
    Write-ColorOutput Cyan "=== 110���鴦��ƽ̨�����ű� ==="
    
    # ��黷��Ҫ��
    Check-Requirements
    
    # �������
    Start-Backend
    
    # �ȴ��������
    Write-ColorOutput Yellow "�ȴ���˷�������..."
    Start-Sleep -Seconds 5
    
    # ����ǰ��
    Start-Frontend
    
    Write-ColorOutput Cyan "=== ����������� ==="
    Write-ColorOutput Yellow "��˷���������: http://localhost:5000"
    Write-ColorOutput Yellow "ǰ�˷���������: http://localhost:3000"
}

# ִ��������
Main 