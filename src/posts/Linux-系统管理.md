---
title: "Linux 系统管理"
excerpt: "深入学习 Linux 系统管理技术，掌握服务器运维和系统优化的核心技能。"
author: "CodeBuddy"
category: "运维"
tags: ["Linux", "系统管理", "运维", "服务器"]
publishedAt: "2024-06-14"
updatedAt: "2024-06-14"
readTime: 32
coverImage: "https://images.unsplash.com/photo-1629654297299-c8506221ca97?w=800&h=400&fit=crop"
isPublished: true
---

# Linux 系统管理

Linux 系统管理是运维工程师的核心技能，涵盖系统监控、性能优化、安全配置等多个方面。本文将深入探讨 Linux 系统管理的最佳实践和核心技术。

## 系统监控

### 系统资源监控

```bash
#!/bin/bash
# system_monitor.sh - 系统监控脚本

# 颜色定义
RED='\033[0;31m'
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
BLUE='\033[0;34m'
NC='\033[0m'

# 日志文件
LOG_FILE="/var/log/system_monitor.log"
ALERT_THRESHOLD_CPU=80
ALERT_THRESHOLD_MEM=85
ALERT_THRESHOLD_DISK=90

log_message() {
    echo "[$(date '+%Y-%m-%d %H:%M:%S')] $1" | tee -a $LOG_FILE
}

# CPU 使用率监控
check_cpu_usage() {
    local cpu_usage=$(top -bn1 | grep "Cpu(s)" | awk '{print $2}' | cut -d'%' -f1)
    cpu_usage=${cpu_usage%.*}
    
    echo -e "${BLUE}CPU 使用率: ${cpu_usage}%${NC}"
    
    if [ $cpu_usage -gt $ALERT_THRESHOLD_CPU ]; then
        echo -e "${RED}警告: CPU 使用率过高 (${cpu_usage}%)${NC}"
        log_message "ALERT: High CPU usage: ${cpu_usage}%"
        
        # 显示占用 CPU 最高的进程
        echo "占用 CPU 最高的进程:"
        ps aux --sort=-%cpu | head -6
    fi
}

# 内存使用监控
check_memory_usage() {
    local mem_info=$(free | grep Mem)
    local total_mem=$(echo $mem_info | awk '{print $2}')
    local used_mem=$(echo $mem_info | awk '{print $3}')
    local mem_usage=$((used_mem * 100 / total_mem))
    
    echo -e "${BLUE}内存使用率: ${mem_usage}%${NC}"
    echo "内存详情:"
    free -h
    
    if [ $mem_usage -gt $ALERT_THRESHOLD_MEM ]; then
        echo -e "${RED}警告: 内存使用率过高 (${mem_usage}%)${NC}"
        log_message "ALERT: High memory usage: ${mem_usage}%"
        
        # 显示占用内存最高的进程
        echo "占用内存最高的进程:"
        ps aux --sort=-%mem | head -6
    fi
}

# 磁盘使用监控
check_disk_usage() {
    echo -e "${BLUE}磁盘使用情况:${NC}"
    df -h
    
    # 检查每个挂载点
    df -h | awk 'NR>1 {print $5 " " $6}' | while read usage mountpoint; do
        usage_num=${usage%\%}
        if [ $usage_num -gt $ALERT_THRESHOLD_DISK ]; then
            echo -e "${RED}警告: 磁盘空间不足 ${mountpoint} (${usage})${NC}"
            log_message "ALERT: Low disk space on ${mountpoint}: ${usage}"
        fi
    done
}

# 网络连接监控
check_network() {
    echo -e "${BLUE}网络连接统计:${NC}"
    netstat -an | awk '/^tcp/ {++state[$NF]} END {for(key in state) print key, state[key]}'
    
    echo -e "\n${BLUE}网络接口流量:${NC}"
    cat /proc/net/dev | grep -E "(eth|ens|enp)" | while read line; do
        interface=$(echo $line | cut -d: -f1 | tr -d ' ')
        rx_bytes=$(echo $line | awk '{print $2}')
        tx_bytes=$(echo $line | awk '{print $10}')
        
        rx_mb=$((rx_bytes / 1024 / 1024))
        tx_mb=$((tx_bytes / 1024 / 1024))
        
        echo "$interface: RX ${rx_mb}MB, TX ${tx_mb}MB"
    done
}

# 系统负载监控
check_load_average() {
    local load_avg=$(uptime | awk -F'load average:' '{print $2}')
    local cpu_cores=$(nproc)
    
    echo -e "${BLUE}系统负载: ${load_avg}${NC}"
    echo "CPU 核心数: $cpu_cores"
    
    # 检查 1 分钟负载
    local load_1min=$(uptime | awk '{print $(NF-2)}' | cut -d',' -f1)
    if (( $(echo "$load_1min > $cpu_cores" | bc -l) )); then
        echo -e "${YELLOW}注意: 系统负载较高${NC}"
        log_message "WARNING: High system load: $load_1min"
    fi
}

# 服务状态检查
check_services() {
    echo -e "${BLUE}关键服务状态:${NC}"
    
    local services=("sshd" "nginx" "mysql" "redis" "docker")
    
    for service in "${services[@]}"; do
        if systemctl is-active --quiet $service; then
            echo -e "$service: ${GREEN}运行中${NC}"
        else
            echo -e "$service: ${RED}已停止${NC}"
            log_message "WARNING: Service $service is not running"
        fi
    done
}

# 主监控函数
main_monitor() {
    echo "========================================="
    echo "系统监控报告 - $(date)"
    echo "========================================="
    
    check_cpu_usage
    echo
    check_memory_usage
    echo
    check_disk_usage
    echo
    check_network
    echo
    check_load_average
    echo
    check_services
    
    echo "========================================="
}

# 执行监控
main_monitor
```

### 性能分析工具

```bash
#!/bin/bash
# performance_analysis.sh - 性能分析脚本

# I/O 性能分析
analyze_io() {
    echo "=== I/O 性能分析 ==="
    
    # iostat 分析
    if command -v iostat &> /dev/null; then
        echo "磁盘 I/O 统计 (5秒间隔, 3次采样):"
        iostat -x 5 3
    fi
    
    # iotop 分析 (需要安装)
    if command -v iotop &> /dev/null; then
        echo "I/O 占用最高的进程:"
        iotop -b -n 1 | head -20
    fi
    
    # 查看磁盘队列深度
    echo "磁盘队列深度:"
    for disk in $(lsblk -d -o NAME | grep -v NAME); do
        queue_depth=$(cat /sys/block/$disk/queue/nr_requests 2>/dev/null || echo "N/A")
        echo "$disk: $queue_depth"
    done
}

# 网络性能分析
analyze_network() {
    echo "=== 网络性能分析 ==="
    
    # 网络接口统计
    echo "网络接口统计:"
    cat /proc/net/dev
    
    # TCP 连接状态统计
    echo "TCP 连接状态:"
    netstat -an | awk '/^tcp/ {++state[$NF]} END {for(key in state) print key, state[key]}'
    
    # 网络错误统计
    echo "网络错误统计:"
    netstat -i
    
    # 带宽使用情况 (需要安装 iftop)
    if command -v iftop &> /dev/null; then
        echo "实时带宽使用 (10秒采样):"
        timeout 10 iftop -t -s 10
    fi
}

# 进程性能分析
analyze_processes() {
    echo "=== 进程性能分析 ==="
    
    # CPU 占用最高的进程
    echo "CPU 占用最高的 10 个进程:"
    ps aux --sort=-%cpu | head -11
    
    # 内存占用最高的进程
    echo "内存占用最高的 10 个进程:"
    ps aux --sort=-%mem | head -11
    
    # 僵尸进程检查
    zombie_count=$(ps aux | awk '$8 ~ /^Z/ { count++ } END { print count+0 }')
    if [ $zombie_count -gt 0 ]; then
        echo "发现 $zombie_count 个僵尸进程:"
        ps aux | awk '$8 ~ /^Z/ { print $2, $11 }'
    fi
    
    # 进程数统计
    echo "进程数统计:"
    echo "总进程数: $(ps aux | wc -l)"
    echo "运行中: $(ps aux | awk '$8 ~ /^R/ { count++ } END { print count+0 }')"
    echo "睡眠中: $(ps aux | awk '$8 ~ /^S/ { count++ } END { print count+0 }')"
    echo "不可中断睡眠: $(ps aux | awk '$8 ~ /^D/ { count++ } END { print count+0 }')"
}

# 系统调用分析
analyze_syscalls() {
    echo "=== 系统调用分析 ==="
    
    # 使用 strace 分析进程 (需要指定 PID)
    if [ ! -z "$1" ]; then
        echo "分析进程 $1 的系统调用 (10秒采样):"
        timeout 10 strace -c -p $1 2>&1 | tail -20
    fi
    
    # 系统调用统计
    echo "系统调用统计:"
    cat /proc/stat | grep -E "^(cpu|intr|ctxt|btime|processes|procs_running|procs_blocked)"
}

# 内存详细分析
analyze_memory() {
    echo "=== 内存详细分析 ==="
    
    # 内存使用详情
    echo "内存使用详情:"
    cat /proc/meminfo
    
    # Slab 内存使用
    echo "Slab 内存使用 (前 10 项):"
    cat /proc/slabinfo | head -11
    
    # 内存映射
    echo "内存映射统计:"
    cat /proc/vmstat | grep -E "(pgfault|pgmajfault|pgpgin|pgpgout)"
    
    # OOM 杀死记录
    echo "OOM 杀死记录:"
    dmesg | grep -i "killed process" | tail -5
}

# 主分析函数
main() {
    echo "性能分析报告 - $(date)"
    echo "========================================"
    
    analyze_io
    echo
    analyze_network
    echo
    analyze_processes
    echo
    analyze_memory
    echo
    
    if [ ! -z "$1" ]; then
        analyze_syscalls $1
    fi
    
    echo "========================================"
    echo "分析完成"
}

# 执行分析
main $1
```

## 用户和权限管理

### 用户管理脚本

```bash
#!/bin/bash
# user_management.sh - 用户管理脚本

# 配置文件
USER_CONFIG="/etc/security/user_policy.conf"
LOG_FILE="/var/log/user_management.log"

# 日志函数
log_action() {
    echo "[$(date '+%Y-%m-%d %H:%M:%S')] $1" >> $LOG_FILE
}

# 创建用户
create_user() {
    local username=$1
    local groups=$2
    local shell=${3:-/bin/bash}
    local home_dir="/home/$username"
    
    if [ -z "$username" ]; then
        echo "错误: 用户名不能为空"
        return 1
    fi
    
    # 检查用户是否已存在
    if id "$username" &>/dev/null; then
        echo "错误: 用户 $username 已存在"
        return 1
    fi
    
    # 创建用户
    useradd -m -d "$home_dir" -s "$shell" "$username"
    
    if [ $? -eq 0 ]; then
        echo "用户 $username 创建成功"
        log_action "Created user: $username"
        
        # 添加到组
        if [ ! -z "$groups" ]; then
            IFS=',' read -ra GROUP_ARRAY <<< "$groups"
            for group in "${GROUP_ARRAY[@]}"; do
                usermod -a -G "$group" "$username"
                echo "用户 $username 已添加到组 $group"
            done
        fi
        
        # 设置密码策略
        chage -M 90 -m 7 -W 7 "$username"
        echo "已设置密码策略: 最大90天，最小7天，警告7天"
        
        # 创建 SSH 目录
        sudo -u "$username" mkdir -p "$home_dir/.ssh"
        sudo -u "$username" chmod 700 "$home_dir/.ssh"
        
        echo "请为用户 $username 设置密码:"
        passwd "$username"
        
    else
        echo "错误: 用户创建失败"
        return 1
    fi
}

# 删除用户
delete_user() {
    local username=$1
    local backup_home=${2:-yes}
    
    if [ -z "$username" ]; then
        echo "错误: 用户名不能为空"
        return 1
    fi
    
    # 检查用户是否存在
    if ! id "$username" &>/dev/null; then
        echo "错误: 用户 $username 不存在"
        return 1
    fi
    
    # 备份用户数据
    if [ "$backup_home" = "yes" ]; then
        local backup_dir="/backup/users/$(date +%Y%m%d)"
        mkdir -p "$backup_dir"
        tar -czf "$backup_dir/${username}_home.tar.gz" "/home/$username" 2>/dev/null
        echo "用户数据已备份到: $backup_dir/${username}_home.tar.gz"
    fi
    
    # 杀死用户进程
    pkill -u "$username"
    sleep 2
    pkill -9 -u "$username"
    
    # 删除用户
    userdel -r "$username"
    
    if [ $? -eq 0 ]; then
        echo "用户 $username 删除成功"
        log_action "Deleted user: $username"
    else
        echo "错误: 用户删除失败"
        return 1
    fi
}

# 修改用户权限
modify_user_permissions() {
    local username=$1
    local action=$2
    local target=$3
    
    case $action in
        "add_sudo")
            usermod -a -G sudo "$username"
            echo "用户 $username 已添加到 sudo 组"
            log_action "Added sudo privileges to user: $username"
            ;;
        "remove_sudo")
            gpasswd -d "$username" sudo
            echo "用户 $username 已从 sudo 组移除"
            log_action "Removed sudo privileges from user: $username"
            ;;
        "add_group")
            usermod -a -G "$target" "$username"
            echo "用户 $username 已添加到组 $target"
            log_action "Added user $username to group: $target"
            ;;
        "remove_group")
            gpasswd -d "$username" "$target"
            echo "用户 $username 已从组 $target 移除"
            log_action "Removed user $username from group: $target"
            ;;
        "lock")
            usermod -L "$username"
            echo "用户 $username 已锁定"
            log_action "Locked user: $username"
            ;;
        "unlock")
            usermod -U "$username"
            echo "用户 $username 已解锁"
            log_action "Unlocked user: $username"
            ;;
        *)
            echo "错误: 未知操作 $action"
            return 1
            ;;
    esac
}

# 用户审计
audit_users() {
    echo "=== 用户审计报告 ==="
    echo "生成时间: $(date)"
    echo
    
    # 系统用户统计
    echo "系统用户统计:"
    echo "总用户数: $(cat /etc/passwd | wc -l)"
    echo "系统用户 (UID < 1000): $(awk -F: '$3 < 1000 {count++} END {print count+0}' /etc/passwd)"
    echo "普通用户 (UID >= 1000): $(awk -F: '$3 >= 1000 {count++} END {print count+0}' /etc/passwd)"
    echo
    
    # 特权用户
    echo "特权用户 (sudo 组):"
    getent group sudo | cut -d: -f4 | tr ',' '\n' | while read user; do
        if [ ! -z "$user" ]; then
            last_login=$(last -1 "$user" | head -1 | awk '{print $4, $5, $6, $7}')
            echo "  $user (最后登录: $last_login)"
        fi
    done
    echo
    
    # 无密码用户
    echo "无密码用户:"
    awk -F: '$2 == "" {print $1}' /etc/shadow
    echo
    
    # 密码过期检查
    echo "密码即将过期的用户 (7天内):"
    for user in $(awk -F: '$3 >= 1000 {print $1}' /etc/passwd); do
        expire_date=$(chage -l "$user" | grep "Password expires" | cut -d: -f2 | xargs)
        if [ "$expire_date" != "never" ] && [ "$expire_date" != "password must be changed" ]; then
            expire_timestamp=$(date -d "$expire_date" +%s 2>/dev/null)
            current_timestamp=$(date +%s)
            days_left=$(( (expire_timestamp - current_timestamp) / 86400 ))
            
            if [ $days_left -le 7 ] && [ $days_left -ge 0 ]; then
                echo "  $user: $days_left 天后过期"
            fi
        fi
    done
    echo
    
    # 长时间未登录用户
    echo "长时间未登录用户 (90天以上):"
    for user in $(awk -F: '$3 >= 1000 {print $1}' /etc/passwd); do
        last_login=$(last -1 "$user" | head -1 | awk '{print $4, $5, $6, $7}')
        if [ "$last_login" != "" ] && [ "$last_login" != "wtmp" ]; then
            last_timestamp=$(date -d "$last_login" +%s 2>/dev/null)
            if [ $? -eq 0 ]; then
                current_timestamp=$(date +%s)
                days_since=$(( (current_timestamp - last_timestamp) / 86400 ))
                
                if [ $days_since -gt 90 ]; then
                    echo "  $user: $days_since 天前 ($last_login)"
                fi
            fi
        fi
    done
}

# SSH 密钥管理
manage_ssh_keys() {
    local username=$1
    local action=$2
    local key_file=$3
    
    local user_home=$(getent passwd "$username" | cut -d: -f6)
    local ssh_dir="$user_home/.ssh"
    local authorized_keys="$ssh_dir/authorized_keys"
    
    case $action in
        "add")
            if [ ! -f "$key_file" ]; then
                echo "错误: 密钥文件 $key_file 不存在"
                return 1
            fi
            
            # 创建 SSH 目录
            sudo -u "$username" mkdir -p "$ssh_dir"
            sudo -u "$username" chmod 700 "$ssh_dir"
            
            # 添加公钥
            cat "$key_file" | sudo -u "$username" tee -a "$authorized_keys" > /dev/null
            sudo -u "$username" chmod 600 "$authorized_keys"
            
            echo "SSH 公钥已添加到用户 $username"
            log_action "Added SSH key for user: $username"
            ;;
        "list")
            if [ -f "$authorized_keys" ]; then
                echo "用户 $username 的 SSH 公钥:"
                cat "$authorized_keys" | nl
            else
                echo "用户 $username 没有 SSH 公钥"
            fi
            ;;
        "remove")
            if [ ! -f "$authorized_keys" ]; then
                echo "用户 $username 没有 SSH 公钥文件"
                return 1
            fi
            
            # 移除指定行的公钥
            if [[ "$key_file" =~ ^[0-9]+$ ]]; then
                sudo -u "$username" sed -i "${key_file}d" "$authorized_keys"
                echo "已移除用户 $username 的第 $key_file 个 SSH 公钥"
                log_action "Removed SSH key #$key_file for user: $username"
            else
                echo "错误: 请指定要移除的公钥行号"
                return 1
            fi
            ;;
        *)
            echo "错误: 未知操作 $action"
            return 1
            ;;
    esac
}

# 主函数
main() {
    case $1 in
        "create")
            create_user "$2" "$3" "$4"
            ;;
        "delete")
            delete_user "$2" "$3"
            ;;
        "modify")
            modify_user_permissions "$2" "$3" "$4"
            ;;
        "audit")
            audit_users
            ;;
        "ssh")
            manage_ssh_keys "$2" "$3" "$4"
            ;;
        *)
            echo "用法: $0 {create|delete|modify|audit|ssh} [参数...]"
            echo
            echo "创建用户: $0 create <用户名> [组列表] [shell]"
            echo "删除用户: $0 delete <用户名> [备份home:yes/no]"
            echo "修改权限: $0 modify <用户名> <操作> [目标]"
            echo "  操作: add_sudo, remove_sudo, add_group, remove_group, lock, unlock"
            echo "用户审计: $0 audit"
            echo "SSH管理: $0 ssh <用户名> <操作> [密钥文件/行号]"
            echo "  操作: add, list, remove"
            exit 1
            ;;
    esac
}

# 检查是否为 root 用户
if [ "$EUID" -ne 0 ]; then
    echo "错误: 此脚本需要 root 权限运行"
    exit 1
fi

# 执行主函数
main "$@"
```

## 系统安全

### 安全加固脚本

```bash
#!/bin/bash
# security_hardening.sh - 系统安全加固脚本

LOG_FILE="/var/log/security_hardening.log"
BACKUP_DIR="/backup/security/$(date +%Y%m%d_%H%M%S)"

log_action() {
    echo "[$(date '+%Y-%m-%d %H:%M:%S')] $1" | tee -a $LOG_FILE
}

# 创建备份目录
mkdir -p $BACKUP_DIR

# SSH 安全配置
harden_ssh() {
    log_action "开始 SSH 安全加固"
    
    # 备份原配置
    cp /etc/ssh/sshd_config $BACKUP_DIR/sshd_config.bak
    
    # SSH 安全配置
    cat > /etc/ssh/sshd_config.d/security.conf << 'EOF'
# SSH 安全配置
Port 2222
Protocol 2
PermitRootLogin no
PasswordAuthentication no
PubkeyAuthentication yes
AuthorizedKeysFile .ssh/authorized_keys
PermitEmptyPasswords no
ChallengeResponseAuthentication no
UsePAM yes
X11Forwarding no
PrintMotd no
ClientAliveInterval 300
ClientAliveCountMax 2
MaxAuthTries 3
MaxSessions 2
LoginGraceTime 60
AllowUsers admin deploy
DenyUsers root
AllowGroups ssh-users
Banner /etc/ssh/banner
EOF
    
    # 创建 SSH banner
    cat > /etc/ssh/banner << 'EOF'
***************************************************************************
                            NOTICE TO USERS
***************************************************************************
This computer system is the private property of its owner, whether
individual, corporate or government. It is for authorized use only.
Users (authorized or unauthorized) have no explicit or implicit
expectation of privacy.

Any or all uses of this system and all files on this system may be
intercepted, monitored, recorded, copied, audited, inspected, and
disclosed to your employer, to authorized site, government, and law
enforcement personnel, as well as authorized officials of government
agencies, both domestic and foreign.

By using this system, the user consents to such interception, monitoring,
recording, copying, auditing, inspection, and disclosure at the
discretion of such personnel or officials. Unauthorized or improper use
of this system may result in civil and criminal penalties and
administrative or disciplinary action, as appropriate. By continuing to
use this system you indicate your awareness of and consent to these terms
and conditions of use. LOG OFF IMMEDIATELY if you do not agree to the
conditions stated in this warning.
***************************************************************************
EOF
    
    # 重启 SSH 服务
    systemctl restart sshd
    log_action "SSH 安全配置完成"
}

# 防火墙配置
configure_firewall() {
    log_action "开始防火墙配置"
    
    # 安装 ufw
    apt-get update && apt-get install -y ufw
    
    # 默认策略
    ufw --force reset
    ufw default deny incoming
    ufw default allow outgoing
    
    # 允许 SSH (新端口)
    ufw allow 2222/tcp comment 'SSH'
    
    # 允许 HTTP/HTTPS
    ufw allow 80/tcp comment 'HTTP'
    ufw allow 443/tcp comment 'HTTPS'
    
    # 允许 DNS
    ufw allow 53 comment 'DNS'
    
    # 限制 SSH 连接频率
    ufw limit 2222/tcp
    
    # 启用防火墙
    ufw --force enable
    
    log_action "防火墙配置完成"
}

# 系统更新和补丁
system_updates() {
    log_action "开始系统更新"
    
    # 更新包列表
    apt-get update
    
    # 升级系统
    apt-get upgrade -y
    
    # 安装安全更新
    apt-get install -y unattended-upgrades
    
    # 配置自动安全更新
    cat > /etc/apt/apt.conf.d/50unattended-upgrades << 'EOF'
Unattended-Upgrade::Allowed-Origins {
    "${distro_id}:${distro_codename}-security";
    "${distro_id}ESMApps:${distro_codename}-apps-security";
    "${distro_id}ESM:${distro_codename}-infra-security";
};
Unattended-Upgrade::AutoFixInterruptedDpkg "true";
Unattended-Upgrade::MinimalSteps "true";
Unattended-Upgrade::Remove-Unused-Dependencies "true";
Unattended-Upgrade::Automatic-Reboot "false";
EOF
    
    # 启用自动更新
    echo 'APT::Periodic::Update-Package-Lists "1";' > /etc/apt/apt.conf.d/20auto-upgrades
    echo 'APT::Periodic::Unattended-Upgrade "1";' >> /etc/apt/apt.conf.d/20auto-upgrades
    
    log_action "系统更新配置完成"
}

# 用户账户安全
secure_accounts() {
    log_action "开始用户账户安全配置"
    
    # 密码策略
    apt-get install -y libpam-pwquality
    
    # 配置密码复杂度
    cat > /etc/security/pwquality.conf << 'EOF'
# 密码长度
minlen = 12
# 最少字符类别数
minclass = 3
# 最大连续相同字符
maxrepeat = 2
# 最大连续字符序列
maxsequence = 3
# 字典检查
dictcheck = 1
# 用户名检查
usercheck = 1
# 强制复杂度
enforcing = 1
EOF
    
    # 账户锁定策略
    cat >> /etc/pam.d/common-auth << 'EOF'
# 账户锁定策略
auth required pam_tally2.so deny=5 unlock_time=900 onerr=fail audit even_deny_root
EOF
    
    # 设置密码过期策略
    sed -i 's/^PASS_MAX_DAYS.*/PASS_MAX_DAYS 90/' /etc/login.defs
    sed -i 's/^PASS_MIN_DAYS.*/PASS_MIN_DAYS 7/' /etc/login.defs
    sed -i 's/^PASS_WARN_AGE.*/PASS_WARN_AGE 14/' /etc/login.defs
    
    # 禁用不必要的用户
    for user in games news uucp proxy www-data backup list irc gnats nobody; do
        if id "$user" &>/dev/null; then
            usermod -L -s /bin/false "$user"
        fi
    done
    
    log_action "用户账户安全配置完成"
}

# 文件系统安全
secure_filesystem() {
    log_action "开始文件系统安全配置"
    
    # 设置重要文件权限
    chmod 600 /etc/shadow
    chmod 600 /etc/gshadow
    chmod 644 /etc/passwd
    chmod 644 /etc/group
    
    # 查找并修复危险权限文件
    find / -type f -perm -4000 -exec ls -la {} \; 2>/dev/null > $BACKUP_DIR/suid_files.txt
    find / -type f -perm -2000 -exec ls -la {} \; 2>/dev/null > $BACKUP_DIR/sgid_files.txt
    find / -type f -perm -1000 -exec ls -la {} \; 2>/dev/null > $BACKUP_DIR/sticky_files.txt
    
    # 查找世界可写文件
    find / -type f -perm -002 -exec ls -la {} \; 2>/dev/null > $BACKUP_DIR/world_writable_files.txt
    
    # 查找无主文件
    find / -nouser -o -nogroup 2>/dev/null > $BACKUP_DIR/orphaned_files.txt
    
    log_action "文件系统安全检查完成，结果保存在 $BACKUP_DIR"
}

# 网络安全
secure_network() {
    log_action "开始网络安全配置"
    
    # 内核参数优化
    cat > /etc/sysctl.d/99-security.conf << 'EOF'
# 网络安全参数
net.ipv4.ip_forward = 0
net.ipv4.conf.all.send_redirects = 0
net.ipv4.conf.default.send_redirects = 0
net.ipv4.conf.all.accept_redirects = 0
net.ipv4.conf.default.accept_redirects = 0
net.ipv4.conf.all.secure_redirects = 0
net.ipv4.conf.default.secure_redirects = 0
net.ipv4.conf.all.accept_source_route = 0
net.ipv4.conf.default.accept_source_route = 0
net.ipv4.conf.all.log_martians = 1
net.ipv4.conf.default.log_martians = 1
net.ipv4.icmp_echo_ignore_broadcasts = 1
net.ipv4.icmp_ignore_bogus_error_responses = 1
net.ipv4.tcp_syncookies = 1
net.ipv4.tcp_max_syn_backlog = 2048
net.ipv4.tcp_synack_retries = 2
net.ipv4.tcp_syn_retries = 5

# IPv6 安全
net.ipv6.conf.all.disable_ipv6 = 1
net.ipv6.conf.default.disable_ipv6 = 1

# 其他安全参数
kernel.dmesg_restrict = 1
kernel.kptr_restrict = 2
kernel.yama.ptrace_scope = 1
fs.suid_dumpable = 0
EOF
    
    # 应用内核参数
    sysctl -p /etc/sysctl.d/99-security.conf
    
    log_action "网络安全配置完成"
}

# 日志和审计
configure_logging() {
    log_action "开始日志和审计配置"
    
    # 安装 auditd
    apt-get install -y auditd audispd-plugins
    
    # 配置审计规则
    cat > /etc/audit/rules.d/audit.rules << 'EOF'
# 删除所有现有规则
-D

# 缓冲区大小
-b 8192

# 失败模式 (0=silent, 1=printk, 2=panic)
-f 1

# 监控系统调用
-a always,exit -F arch=b64 -S adjtimex -S settimeofday -k time-change
-a always,exit -F arch=b32 -S adjtimex -S settimeofday -S stime -k time-change
-a always,exit -F arch=b64 -S clock_settime -k time-change
-a always,exit -F arch=b32 -S clock_settime -k time-change
-w /etc/localtime -p wa -k time-change

# 监控用户和组管理
-w /etc/group -p wa -k identity
-w /etc/passwd -p wa -k identity
-w /etc/gshadow -p wa -k identity
-w /etc/shadow -p wa -k identity
-w /etc/security/opasswd -p wa -k identity

# 监控网络配置
-a always,exit -F arch=b64 -S sethostname -S setdomainname -k system-locale
-a always,exit -F arch=b32 -S sethostname -S setdomainname -k system-locale
-w /etc/issue -p wa -k system-locale
-w /etc/issue.net -p wa -k system-locale
-w /etc/hosts -p wa -k system-locale
-w /etc/network -p wa -k system-locale

# 监控登录事件
-w /var/log/faillog -p wa -k logins
-w /var/log/lastlog -p wa -k logins
-w /var/log/tallylog -p wa -k logins

# 监控进程和会话启动
-w /var/run/utmp -p wa -k session
-w /var/log/wtmp -p wa -k logins
-w /var/log/btmp -p wa -k logins

# 监控权限修改
-a always,exit -F arch=b64 -S chmod -S fchmod -S fchmodat -F auid>=1000 -F auid!=4294967295 -k perm_mod
-a always,exit -F arch=b32 -S chmod -S fchmod -S fchmodat -F auid>=1000 -F auid!=4294967295 -k perm_mod
-a always,exit -F arch=b64 -S chown -S fchown -S fchownat -S lchown -F auid>=1000 -F auid!=4294967295 -k perm_mod
-a always,exit -F arch=b32 -S chown -S fchown -S fchownat -S lchown -F auid>=1000 -F auid!=4294967295 -k perm_mod

# 监控文件删除
-a always,exit -F arch=b64 -S unlink -S unlinkat -S rename -S renameat -F auid>=1000 -F auid!=4294967295 -k delete
-a always,exit -F arch=b32 -S unlink -S unlinkat -S rename -S renameat -F auid>=1000 -F auid!=4294967295 -k delete

# 监控 sudo 使用
-w /etc/sudoers -p wa -k scope
-w /etc/sudoers.d/ -p wa -k scope

# 监控内核模块
-w /sbin/insmod -p x -k modules
-w /sbin/rmmod -p x -k modules
-w /sbin/modprobe -p x -k modules
-a always,exit -F arch=b64 -S init_module -S delete_module -k modules

# 使配置不可变
-e 2
EOF
    
    # 启动审计服务
    systemctl enable auditd
    systemctl restart auditd
    
    # 配置日志轮转
    cat > /etc/logrotate.d/security << 'EOF'
/var/log/security_hardening.log {
    weekly
    missingok
    rotate 52
    compress
    delaycompress
    notifempty
    create 640 root adm
}
EOF
    
    log_action "日志和审计配置完成"
}

# 主函数
main() {
    echo "开始系统安全加固..."
    echo "备份目录: $BACKUP_DIR"
    
    harden_ssh
    configure_firewall
    system_updates
    secure_accounts
    secure_filesystem
    secure_network
    configure_logging
    
    echo "系统安全加固完成！"
    echo "请检查日志文件: $LOG_FILE"
    echo "备份文件位于: $BACKUP_DIR"
    echo
    echo "重要提醒:"
    echo "1. SSH 端口已更改为 2222"
    echo "2. 已禁用 root 登录和密码认证"
    echo "3. 请确保已配置 SSH 密钥"
    echo "4. 建议重启系统以应用所有更改"
}

# 检查权限
if [ "$EUID" -ne 0 ]; then
    echo "错误: 此脚本需要 root 权限运行"
    exit 1
fi

# 执行主函数
main
```

## 总结

Linux 系统管理的核心要点：

1. **系统监控** - 资源监控、性能分析、服务状态检查
2. **用户管理** - 用户创建、权限控制、SSH 密钥管理
3. **安全加固** - SSH 安全、防火墙配置、系统更新
4. **文件系统** - 权限管理、磁盘监控、备份策略
5. **网络安全** - 内核参数、网络配置、访问控制
6. **日志审计** - 审计规则、日志分析、安全监控

掌握这些技能将让你能够有效管理和维护 Linux 服务器系统。