# 设置编码为 GBK
[Console]::OutputEncoding = [System.Text.Encoding]::GetEncoding('gbk')
$OutputEncoding = [System.Text.Encoding]::GetEncoding('gbk')

# 设置错误时停止执行
$ErrorActionPreference = "Stop"

# 定义颜色函数
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

# 检查是否安装了必要的工具
function Check-Requirements {
    Write-ColorOutput Green "检查环境要求..."
    
    # 检查 Node.js
    try {
        $nodeVersion = node --version
        Write-ColorOutput Green "Node.js 版本: $nodeVersion"
    }
    catch {
        Write-ColorOutput Red "错误: 未安装 Node.js，请先安装 Node.js"
        exit 1
    }
      
    # 检查 conda
    try {
        $condaVersion = conda --version
        Write-ColorOutput Green "Conda 版本: $condaVersion"
    }
    catch {
        Write-ColorOutput Red "错误: 未安装 Conda，请先安装 Conda"
        exit 1
    }

    # 检查 Python
    try {
        conda activate you
        $pythonVersion = python --version
        Write-ColorOutput Green "Python 版本: $pythonVersion"
    }
    catch {
        Write-ColorOutput Red "错误: 未安装 Python，请先安装 Python"
        exit 1
    }
}

# 启动后端服务
function Start-Backend {
    Write-ColorOutput Green "正在启动后端服务..."
    Set-Location backend
    
    # 激活 conda 环境
    Write-ColorOutput Yellow "激活 conda 环境..."
    conda activate you
    
    # 安装依赖
    Write-ColorOutput Yellow "安装后端依赖..."
    pip install -r requirements.txt
    
    # 启动后端服务
    Write-ColorOutput Green "启动 Flask 服务..."
    Start-Process powershell -ArgumentList "-NoExit", "-Command", "[Console]::OutputEncoding = [System.Text.Encoding]::GetEncoding('gbk'); `$OutputEncoding = [System.Text.Encoding]::GetEncoding('gbk'); conda activate you; flask run"
    
    Set-Location ..
}

# 启动前端服务
function Start-Frontend {
    Write-ColorOutput Green "正在启动前端服务..."
    Set-Location frontend
    
    # 安装依赖
    Write-ColorOutput Yellow "安装前端依赖..."
    npm install
    
    # 启动前端服务
    Write-ColorOutput Green "启动 React 开发服务器..."
    Start-Process powershell -ArgumentList "-NoExit", "-Command", "[Console]::OutputEncoding = [System.Text.Encoding]::GetEncoding('gbk'); `$OutputEncoding = [System.Text.Encoding]::GetEncoding('gbk'); npm start"
    
    Set-Location ..
}

# 主函数
function Main {
    Write-ColorOutput Cyan "=== 110警情处理平台启动脚本 ==="
    
    # 检查环境要求
    Check-Requirements
    
    # 启动后端
    Start-Backend
    
    # 等待后端启动
    Write-ColorOutput Yellow "等待后端服务启动..."
    Start-Sleep -Seconds 5
    
    # 启动前端
    Start-Frontend
    
    Write-ColorOutput Cyan "=== 服务启动完成 ==="
    Write-ColorOutput Yellow "后端服务运行在: http://localhost:5000"
    Write-ColorOutput Yellow "前端服务运行在: http://localhost:3000"
}

# 执行主函数
Main 