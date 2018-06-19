# 常用的shell函数

偶然发现的一篇博客中总结了shell中常用的一些函数，非常实用，也可以作为学习shell的绝佳材料。

[感谢大神，原文在此](http://hongjiang.info/2018/01/)

```shell
# check current os is linux
function cf_is_linux() {
  [[ "$OSTYPE" = *linux* ]] && echo "true" && return 0
  echo "false" && return 1
}

# check current os is mac/darwin
function cf_is_darwin() {
  [[ "$OSTYPE" = *darwin* ]] && echo "true" && return 0
  echo "false" && return 1
}

# check current os is windows/cygwin
function cf_is_cygwin() {
  [[ "$OSTYPE" = *cygwin* ]] && echo "true" && return 0
  echo "false" && return 1
}

function cf_is_gnu_date() {
  date --version >/dev/null 2>&1 && echo "true" && return 0
  echo "false" && return 1
}

function cf_is_gnu_sed() {
  sed --version >/dev/null 2>&1 && echo "true" && return 0
  echo "false" && return 1
}

function cf_is_gnu_awk() {
  awk --version | grep GNU >/dev/null && echo "true" && return 0
  echo "false" && return 1
}

function cf_is_gnu_grep() {
  grep --version | grep GNU >/dev/null && echo "true" && return 0
  echo "false" && return 1
}

# java style startsWith
function cf_starts_with() {
  local str=$1
  local pre=$2
  [[ "$str" ==  ${pre}* ]]
}

# java style substring
function cf_substring() {
  local str=$1
  local begin=$2
  local end=$3
  if [ -z "$end" ]; then
    echo ${str:$begin} 
  else
    local len=`expr $end - $begin`
    echo ${str:$begin:$len}
  fi
}

# get current shell name
function cf_shell_name() {
  local name=$( ps -ocommand= -p $$ | awk '{print $1}')
  if cf_starts_with $name "-"; then
    cf_substring $name 1
  else
    echo $name
  fi
}

# check current shell is bash
function cf_is_bash() {
  [[ `cf_shell_name` = "-bash" || `basename $(cf_shell_name)` = "bash" ]] && echo "true" && return 0
  echo "false" && return 1
}

# check current shell is zsh
function cf_is_zsh() {
  [[ `cf_shell_name` = "-zsh" || `basename $(cf_shell_name)` = "zsh" ]] && echo "true" && return 0
  echo "false" && return 1
}

function _script_dir() {
  if cf_is_bash >/dev/null; then
    cd "$( dirname "${BASH_SOURCE[0]}" )" && pwd -P 
  elif cf_is_zsh >/dev/null; then
    cd "$( dirname "${(%):-%N}" )" && pwd -P 
  else
    echo "unsupported shell" && return 1
  fi
}

function _script_file() {
  if cf_is_bash >/dev/null; then
    basename "${BASH_SOURCE[0]}" 
  elif cf_is_zsh >/dev/null; then
    basename "${(%):-%N}" 
  else
    echo "unsupported shell" && return 1
  fi
}

# colorful grep. private function
function _get_colorful_grep() {
  cf_is_gnu_grep >/dev/null && echo "grep --color" && return 0
  export GREP_OPTIONS='--color=always'
  export GREP_COLOR='1;35;40'
  echo "grep" 
}

# list all common functions
function cf_functions() {
  if cf_is_bash >/dev/null; then
    declare -F | awk '{print $NF}' | grep "cf_" | sort
  elif cf_is_zsh >/dev/null; then
    print -l ${(ok)functions} | grep "cf_" | sort
  else
    echo "unsupported shell" && return 1
  fi
}

# get total memory (MB)
function cf_mem_total() {
  if cf_is_linux >/dev/null; then
    free -m | awk '/^Mem/{print $2"M"}'
  elif cf_is_darwin >/dev/null; then
    sysctl hw.memsize | awk '{print $2/1024/1024"M"}'
  else
    echo "unsupported os" && return 1
  fi 
}

# decimal to hexadecimal
function cf_dec2Hex() {
  printf "%x" $1
}

# decimal to octal 
function cf_dec2Oct() {
  printf "%o" $1
}

# decimal to binary
function cf_dec2Bin() {
  echo "obase=2; $1" | bc
}

# hexadecimal to decimal 
function cf_hex2Dec() {
  echo $((16#$1))
}

# octal to decimal 
function cf_oct2Dec() {
  echo $((8#$1))
}

# binary to decimal 
function cf_bin2Dec() {
  echo $((2#$1))
}

function cf_calc() {
  local exp="$1"
  echo "$exp" | bc -l | awk '{printf "%.2f", $0}'
}

# warning and exit, not for interactive shell
function cf_die() {
  local msg="$1"
  local code=${2:-1}
  echo "$msg" && exit $code
}

# highlight key words from file or pipeline
function cf_highlight() {
  local keyword="$1"
  local cgrep="$(_get_colorful_grep)"
  if [ -p /dev/stdin ]; then
    # from pipeline
    while IFS='' read line; do
      echo $line | eval "$cgrep -E \"${keyword}|$\""
    done
  else
    local file="$2"
    eval "$cgrep -E \"${keyword}|$\"" "$file"
  fi
}

function cf_ps_env() {
  local pid=$1
  ! cf_is_pid_exists >/dev/null $pid && echo "pid:$pid not exists" && return 1

  if cf_is_linux >/dev/null; then
    xargs --null --max-args=1 < /proc/$pid/environ
  elif cf_is_darwin >/dev/null; then
    ps -wwE -p $pid
  else
    echo "unsupported os" && return 1
  fi
}

# get bash(current shell) major version
function cf_bash_major_ver() {
  echo ${BASH_VERSINFO[0]}
}

# get bash(current shell) minor version
function cf_bash_minor_ver() {
  echo ${BASH_VERSINFO[1]}
}

# get kernel version
function cf_kernel_ver() {
  if cf_is_linux >/dev/null; then
    uname -r | cut -d'-' -f1
  elif cf_is_darwin >/dev/null; then
    uname -r | cut -d'-' -f1
  else
    echo "unsupported os" && return 1
  fi
}

# get kernel major version
function cf_kernel_major_ver() {
  if cf_is_linux >/dev/null; then
    uname -r | awk -F'.' '{print $1"."$2}' 
  elif cf_is_darwin >/dev/null; then
    uname -r | awk -F'.' '{print $1"."$2}' 
  else
    echo "unsupported os" && return 1
  fi
}

# get kernel minor version
function cf_kernel_minor_ver() {
  if cf_is_linux >/dev/null; then
    uname -r | awk -F'.' '{print $3}'
  elif cf_is_darwin >/dev/null; then
    uname -r | awk -F'.' '{print $3}'
  else
    echo "unsupported os" && return 1
  fi
}

# get value from config file such as app.properties
function cf_get_property() {
  local file="$1"
  local key="$2"
  grep "^${key}=" "$file" | tr -d '\r' | cut -d'=' -f2 | cf_trim
}

# get command path, eg: `cf_command_path ls` output /usr/bin/ls
function cf_command_path() {
  local cmd=$1
  cf_is_bash && builtin type -P $cmd && return $?

  if [ -x /usr/bin/which ]; then
    local p=$( /usr/bin/which $1 | head -1 )
    [ ! -z "$p" ] && echo $p && return 0
    return 1
  else
    local p=$( which $1 | grep "^/" | head -1 )
    [ ! -z "$p" ] && echo $p && return 0
    return 1
  fi
}

# get all ip addresses
function cf_ip_list() {
  if [ -x /sbin/ip ]; then
    local list=$(/sbin/ip -o -4 addr list | awk '{print $4}' | cut -d'/' -f1 | tr '\n' ',')
  else
    local list=$(/sbin/ifconfig | grep "inet " | awk '{print $2}' | sed 's/addr://' | tr '\n' ',')
  fi
  echo ${list%,}
}

function cf_stdio() {
  local pid=$1
  /usr/sbin/lsof -a -p $pid -d 0,1,2
}

function cf_stdout() {
  local pid=$1
  if cf_is_linux >/dev/null; then
    readlink -f /proc/$pid/fd/1
  elif cf_is_darwin >/dev/null; then
    /usr/sbin/lsof -a -p $pid -d 1 | awk 'NR>1{print $NF}'
  else
    echo "unsupported os" && return 1
  fi
}

# get file last modification time
function cf_last_modification() {
  local file="$1"
  if [[ $OSTYPE == *linux* ]];then
    date +%Y%m%d%H%M%S -r $file
  elif [[ $OSTYPE == *darwin* ]];then
    stat -f "%Sm" -t "%Y%m%d%H%M%S" $file
  fi
}

# check current user is root 
function cf_is_root() {
  [ `whoami` = "root" ] && echo "true" && return 0
  echo "false" && return 1
}

# check current shell is interactive
function cf_is_interactive_shell() {
  if cf_is_bash >/dev/null; then
    [[ "$-" = *i* ]] && echo "true" && return 0
  elif cf_is_zsh >/dev/null; then
    [[ -o interactive ]] && echo "true" && return 0
  else
    echo "unsupported shell" && return 1
  fi
  echo "false" && return 1
}

# check current shell is login shell
function cf_is_login_shell() {
  if cf_is_bash >/dev/null; then
    shopt -q login_shell && echo "true" && return 0
  elif cf_is_zsh >/dev/null; then
    [[ -o login ]] && echo "true" && return 0
  else
    echo "unsupported shell" && return 1
  fi
  echo "false" && return 1
}

# check command is exists
function cf_is_command_exists() {
  local cmd=$1
  if [ -x /usr/bin/which ]; then
    /usr/bin/which $cmd >/dev/null 2>&1 && echo "true" && return 0
  else
    which $cmd >/dev/null 2>&1 && echo "true" && return 0 
  fi
  echo "false" && return 1
}

# check file name globbing flag
function cf_is_glob_enabled() {
  if cf_is_bash >/dev/null; then 
    [[ $- != *f* ]] && echo "true" && return 0
  elif cf_is_zsh >/dev/null; then
    [[ -o glob ]] && echo "true" && return 0
  else
    echo "unsupported shell" && return 1
  fi
  echo "false" && return 1
}

# enable file name globbing
function cf_enable_glob() {
  cf_is_bash >/dev/null && set +f && return 0
  cf_is_zsh >/dev/null && set -o glob && return 0
  echo "unsupported shell" && return 1
}

# disable file name globbing
function cf_disable_glob() {
  cf_is_bash >/dev/null && set -f && return 0
  cf_is_zsh >/dev/null && set -o noglob && return 0
  echo "unsupported shell" && return 1
}

# check extglob flag
function cf_is_extglob_enabled() {
  if cf_is_bash >/dev/null; then 
    shopt -q extglob && echo "true" && return 0
  elif cf_is_zsh >/dev/null; then
    [[ -o kshglob ]] && echo "true" && return 0
  else
    echo "unsupported shell" && return 1
  fi
  echo "false" && return 1
}

# enable extglob 
function cf_enable_extglob() {
  cf_is_bash >/dev/null && shopt -s extglob && return 0
  cf_is_zsh >/dev/null && set -o kshglob && return 0
  echo "unsupported shell" && return 1
}

# disable extglob 
function cf_disable_extglob() {
  cf_is_bash >/dev/null && shopt -u extglob && return 0
  cf_is_zsh >/dev/null && unsetopt kshglob && return 0
  echo "unsupported shell" && return 1
}

# check pid is exists
function cf_is_pid_exists() {
  local pid=$1
  [ -z "$pid" ] && echo "false" && return 1
  kill -0 $pid >/dev/null 2>&1 && echo "true" && return 0
  echo "false" && return 1
}

function cf_is_java() {
  local pid=$1
  ! cf_is_pid_exists >/dev/null $pid && echo "pid:$pid not exists" && return 1
  ps -ocommand= -p$pid | awk '$1~/java$/' > /dev/null && echo "true" && return 0
  echo "false" && return 1
}

function cf_is_available_port() {
  local port=$1
  if [[ "$OSTYPE" = *linux* ]];then
    local r=$( netstat -ant | awk '$6=="LISTEN" && $4~":'$port'$"' )
  elif [[ "$OSTYPE" = *darwin* ]];then
    local r=$( netstat -ant | awk '$6=="LISTEN"' | grep "\.$port " )
  else
    echo "unknown system" && return 1
  fi

  [ -z "$r" ] && echo "true" && return 0;
  echo "false" && return 1 # port has been used
}

function cf_defined() {
  if cf_is_bash >/dev/null; then
    [[ ${!1-X} == ${!1-Y} ]]
  elif cf_is_zsh >/dev/null; then
    [[ ${(P)1-X} == ${(P)1-Y} ]]
  else
    echo "unsupported shell" && return 1
  fi
}

function cf_has_value() {
    cf_defined $1 || return 1
    if cf_is_bash >/dev/null; then
      [[ -n ${!1} ]] && return 0
    elif cf_is_zsh >/dev/null; then
      [[ -n ${(P)1} ]] && return 0
    fi
    return 1
}

function cf_has_sudo_privilege() {
  # do not need password
  sudo -n echo >/dev/null 2>&1
}

function cf_timestamp() {
  date +%F-%T | tr ':-' '_' #2015_12_01_22_15_22
}

function cf_length() {
  echo ${#1}
}

# trim string
function cf_trim() {
  if [ -p /dev/stdin ]; then
    while IFS='' read line; do
      _trim "$line"
    done
  else
    _trim "$1"
  fi
}

# private function
function _trim() {
  local str="$1"
  local extglob=$(cf_is_extglob_enabled)
  if cf_is_bash >/dev/null || cf_is_zsh >/dev/null; then
    [ $extglob = "false" ] && cf_enable_extglob
    str="${str##*( )}"
    str="${str%%*( )}"
    [ $extglob = "false" ] && cf_disable_extglob
  else
    echo "unsupported shell" && return 1
  fi
  echo $str
}

function cf_lower() {
  echo "$1" | tr '[:upper:]' '[:lower:]'
}

function cf_upper() {
  echo "$1" | tr '[:lower:]' '[:upper:]'
}

function cf_ps_name() {
  local pid=$1
  ! cf_is_pid_exists >/dev/null $pid && echo "pid:$pid not exists" && return 1
  if cf_is_java $pid >/dev/null; then
    local main=$(cf_ps_java_main $pid)
    echo "java($main)"
  else
    ps -ocommand= -p $pid | awk '{print $1}'
  fi
}

function cf_ppid() {
  local pid=$1
  ! cf_is_pid_exists >/dev/null $pid && echo "pid:$pid not exists" && return 1
  ps -oppid= -p $pid
}

function cf_ps_java_main() {
  local pid=$1
  ! cf_is_pid_exists >/dev/null $pid && echo "pid:$pid not exists" && return 1
  ps -ocommand= -p $pid | tr ' ' '\n' | awk '/-classpath|-cp/{getline;next};/^-/{next}1' | awk 'NR==2'
}

function cf_ps_time() {
  local pid=$1
  ! cf_is_pid_exists >/dev/null $pid && echo "pid:$pid not exists" && return 1

  local elapsed="$(ps -oetime= -p $pid | cf_trim)"
  local started="$(ps -olstart= -p $pid | cf_trim)"
  if [ `cf_is_gnu_date` = "true" ]; then
    started=$(date +'%Y-%m-%d %H:%M:%S' -d "$started")
  fi
  local cpu_time=$(ps -otime= -p $pid | cf_trim)
  echo "started from: $started, elapsed: $elapsed, cumulative cpu time: $cpu_time"
}

function cf_ps_zombies() {
  ps -opid,state,command -e | awk 'NR==1 || $2=="Z"'
}

function cf_connection_topology() {
  local pid=$1
  ! cf_is_pid_exists >/dev/null $pid && echo "pid:$pid not exists" && return 1

  /usr/sbin/lsof -Pan -iTCP -p $pid > /tmp/.$pid.lsof
  grep -o "[0-9.:]*->[0-9.:]*" /tmp/.$pid.lsof > /tmp/.$pid.conns
  grep "LISTEN" /tmp/.$pid.lsof | awk '$9~/*/{print substr($9,3)}' > /tmp/.$pid.ports

  echo "-------------- downstream -------------"
  for port in $(cat /tmp/.$pid.ports); do
    cf_connection_list_by_port $port | awk '$6=="ESTABLISHED" {print $5}' | cut -d':' -f1 | sort | uniq -c | awk '{print $2"-->localhost:"'$port'" ("$1")"}'
  done

  echo "-------------- upstream ---------------"
  local portsExpr=$(cat /tmp/.$pid.ports | sed -e 's/^/:/' -e 's/$/->/' | xargs | sed 's/ /|/g')
  grep -Ev "$portsExpr" /tmp/.$pid.conns > /tmp/.$pid.out
  awk -F'->' '{print $2}' /tmp/.$pid.out | sort | uniq -c | sort -nrk1 | awk '{print "localhost-->"$2" ("$1")"}'
  rm -f /tmp/.$pid.lsof /tmp/.$pid.conns /tmp/.$pid.ports
}

function cf_connection_list_by_pid() {
  local pid=$1
  ! cf_is_pid_exists >/dev/null $pid && echo "pid:$pid not exists" && return 1
  /usr/sbin/lsof -Pan -iTCP -p $pid
}

function cf_connection_list_by_port() {
  local port=$1
  netstat -ant| awk '$4~/[:.]'"$port"'$/'
}

function cf_connection_stat_by_pid() {
  local pid=$1
  ! cf_is_pid_exists >/dev/null $pid && echo "pid:$pid not exists" && return 1
  local interval=${2:-1}
  /usr/sbin/lsof -Pan -iTCP -p $pid -r $interval
}

function cf_connection_stat_by_port() {
  local port=$1
  netstat -ant -c| awk '$1=="Proto"{print "\n"$0};$4~/[:.]'"$port"'$/'
}

function cf_listening_sockets() {
  #lsof -Pnl -i4TCP -sTCP:LISTEN #low version unsupported -sTCP params
  if cf_is_linux >/dev/null || cf_is_darwin >/dev/null; then
    if cf_has_sudo_privilege; then
      sudo /usr/sbin/lsof -Pnl -i4TCP | grep LISTEN
    else
      /usr/sbin/lsof -Pnl -i4TCP | grep LISTEN
    fi
  else
    netstat -plnt 2>/dev/null | grep -v tcp6
  fi
}

function cf_traffic_by_eth() {
  local eth=${1:-"eth0"}
  if cf_is_linux >/dev/null; then
    [ ! -d /sys/class/net/$eth ] && echo "network interface not exists." && return 1
    while true; do
      local r1=`cat /sys/class/net/$eth/statistics/rx_bytes`
      local t1=`cat /sys/class/net/$eth/statistics/tx_bytes`
      sleep 1
      local r2=`cat /sys/class/net/$eth/statistics/rx_bytes`
      local t2=`cat /sys/class/net/$eth/statistics/tx_bytes`
      local rkbps=`cf_calc "( $r2 - $r1 ) / 1024"`
      local tkbps=`cf_calc "( $t2 - $t1 ) / 1024"`
      echo "$eth: RX $rkbps kB/s TX $tkbps kB/s"
    done
  elif cf_is_darwin >/dev/null; then
    # `netstat -I eth0 -w 1` or `nettop -n -m tcp`
    declare -a tuple
    local _i1=0
    cf_is_zsh >/dev/null && _i1=1
    local _i2=1
    cf_is_zsh >/dev/null && _i1=2
    while true; do
      tuple=( $(netstat -nbi -I $eth | tail -1 | awk '{print $7,$10}') )
      local r1=${tuple[$_i1]}
      local t1=${tuple[$_i2]}
      sleep 1
      tuple=( $(netstat -nbi -I $eth | tail -1 | awk '{print $7,$10}') )
      local r2=${tuple[$_i1]}
      local t2=${tuple[$_i2]}
      local rkbps=`cf_calc "( $r2 - $r1 ) / 1024"`
      local tkbps=`cf_calc "( $t2 - $t1 ) / 1024"`
      echo "$eth: RX $rkbps kB/s TX $tkbps kB/s"
    done
  else
    echo "unsupported os" && return 1
  fi
}

function cf_traffic_by_pid() {
  ! cf_is_linux >/dev/null && echo "only works in linux" && return 1
  local pid=$1
  ! cf_is_pid_exists >/dev/null $pid && echo "pid:$pid not exists" && return 1

  # kernel 2.6.18 not support, must 2.6.32 or later?
  local pf="/proc/$pid/net/netstat"
  [ ! -f $pf ] && echo "$pf not found!" && return 1

  declare -a tuple
  local _i1=0
  cf_is_zsh >/dev/null && _i1=1
  local _i2=1
  cf_is_zsh >/dev/null && _i1=2
  local pname="$(cf_ps_name $pid)"
  while true; do
    tuple=( $(grep "IpExt: " $pf | awk 'NR==2{print $8,$9}') )
    local r1=${tuple[$_i1]}
    local t1=${tuple[$_i2]}
    sleep 1
    tuple=( $(grep "IpExt: " $pf | awk 'NR==2{print $8,$9}') )
    local r2=${tuple[$_i1]}
    local t2=${tuple[$_i2]}
    local rkbps=`cf_calc "( $r2 - $r1 ) / 1024"`
    local tkbps=`cf_calc "( $t2 - $t1 ) / 1024"`
    echo "$pname: IN $rkbps kB/s OUT $tkbps kB/s"
  done
}

function cf_iotop() {
  sudo iotop -bod1
}

function cf_check_sum() {
  local dir=${1:-$PWD}
  local dirsum=0
  for sum  in $(find ${dir} -type f -print0 | xargs -0 cksum | awk '{print $1}')
  do
    dirsum=$(( ${sum} + ${dirsum} ))
  done
  echo ${dirsum}
}

function cf_java_classpath_check() {
  [ $# -eq 0 ] && echo "please enter classpath dir" && return 1
  [ ! -d "$1" ] && echo "not a directory" && return 1

  local tmpfile="/tmp/.cp$(date +%s)"
  local tmphash="/tmp/.hash$(date +%s)"
  local verbose="/tmp/cp-verbose.log"

  if cf_is_zsh >/dev/null;then
    local -a files
    local begin=1
  elif cf_is_bash >/dev/null;then
    declare -a files
    local begin=0
  else 
    echo "unsupported shell" && return 1
  fi
  files=(`find "$1" -name "*.jar"`)

  for f in $files; do
    jarName=`basename $f`
    list=`unzip -l $f | awk -v fn=$jarName '/\.class$/{print $NF,fn}'`
    size=`echo "$list" | wc -l`
    echo $jarName $size >> $tmphash
    echo "$list"
  done | sort | awk 'NF{ a[$1]++;m[$1]=m[$1]","$2}END{for(i in a) if(a[i] > 1) print i,substr(m[i],2)}' > $tmpfile

  awk '{print $2}' $tmpfile | awk -F',' '{i=1;for(;i<=NF;i++) for(j=i+1;j<=NF;j++) print $i,$j}' | sort | uniq -c | sort -nrk1 | 
  while read line; do
    local dup=${line%% *}
    local jars=${line#* }
    local jar1=${jars% *}
    local jar2=${jars#* }
    local len_jar1=`grep -F "$jar1" $tmphash | grep ^"$jar1" | awk '{print $2}'`
    local len_jar2=`grep -F "$jar2" $tmphash | grep ^"$jar2" | awk '{print $2}'`
    local len=$(($len_jar1 > $len_jar2 ? $len_jar1 : $len_jar2))
    local per=$(echo "scale=2; $dup/$len" | bc -l)
    echo ${per/./} $dup $jar1 $jar2
  done | sort -nr -k1 -k2 | awk 'NR==1{print "Similarity DuplicateClasses File1 File2"}{print "%"$0}'| column -t

  sort $tmpfile | awk '{print $1,"\n\t\t",$2}' > $verbose
  echo "See $verbose for more details."

  rm -f $tmpfile
  rm -f $tmphash
}

function cf_java_class_find() {
  local libdir=$1
  local name=$2
  local glob=$(cf_is_glob_enabled)
  [ $glob = "false" ] && cf_enable_glob
  builtin pushd $libdir >/dev/null
  for j in *.jar; do
    unzip -l $j | grep $name && echo $j;
  done
  builtin popd >/dev/null
  [ $glob = "false" ] && cf_disable_glob
}

function cf_java_pids() {
  ps x | grep "jav[a]" | awk '{print $1}'
}

function cf_java_infos() {
  for p in `cf_java_pids`; do
    echo "java pid: $p"
    info=`ps -opid=,command= -p $p | tr ' ' '\n' | awk '/-classpath|-cp/{getline;next};/-Xmx|-Dcatalina.base/{print};/^-/{next};1' | xargs`
    echo "  $info"
    time=`cf_ps_time $p`
    echo "  $time"
  done
}

function cf_java_threads() {
  local pid=$1
  local vm_threads="GC task|VM |CompilerThread|Finalizer|Reference Handler|Signal Dispatcher"
  "$JAVA_HOME"/bin/jstack $pid | grep "^\"" | grep -Ev "$vm_threads"
}

function cf_java_sysprops() {
  local pid=$1
  ! cf_is_pid_exists >/dev/null $pid && echo "pid:$pid not exists" && return 1
  "$JAVA_HOME"/bin/jinfo -sysprops $pid
}

function cf_jstack_series() {
  local pid=$1
  ! cf_is_pid_exists >/dev/null $pid && echo "pid:$pid not exists" && return 1
  local count=${2:-5}  # defaults 5 times
  local delay=${3:-0.5} # defaults 0.5 seconds

  local logdir=${LOG_DIR:-"/tmp"}
  while [ $count -gt 0 ]; do
    if cf_is_gnu_date >/dev/null; then 
      local suffix=$(date +%H%M%S.%N)
    else
      local suffix=$(date +%H%M%S)"."$count
    fi
    "$JAVA_HOME"/bin/jstack $pid > $logdir/jstack.$pid.$suffix
    sleep $delay
    let count--
    echo -n "."
  done
}

function cf_dmesg() {
  ! cf_is_linux >/dev/null && echo "only works in linux" && return 1

  dmesg -T "$@" 2>/dev/null
  [ $? -eq 0 ] && return 0

  dmesg "$@" | perl -w -e 'use strict;
  my ($uptime) = do { local @ARGV="/proc/uptime";<>}; ($uptime) = ($uptime =~ /^(\d+)\./);
  foreach my $line (<>) {
    printf( ($line=~/^\[\s*(\d+)\.\d+\](.+)/) ? ( "[%s]%s\n", scalar localtime(time - $uptime + $1), $2 ) : $line )
  }'
}

function cf_trace_http_request() {
  ! cf_is_linux >/dev/null && echo "only works in linux" && return 1
  local pid=$1
  ! cf_is_pid_exists >/dev/null $pid && echo "pid:$pid not exists" && return 1
  strace -e read -s 2000 -qftp $pid 2>&1 | grep " HTTP/1[.][01][\]r[\]n" 
}

function cf_trace_http_response() {
  ! cf_is_linux >/dev/null && echo "only works in linux" && return 1
  local pid=$1
  ! cf_is_pid_exists >/dev/null $pid && echo "pid:$pid not exists" && return 1
  strace -e write -s 2000 -qftp $pid 2>&1 | grep "HTTP/1[.][01] " 
}

function cf_trace_http_req_header() {
  ! cf_is_linux >/dev/null && echo "only works in linux" && return 1
  local pid=$1
  ! cf_is_pid_exists >/dev/null $pid && echo "pid:$pid not exists" && return 1
  strace -e read -s 2000 -qftp $pid 2>&1 | grep " HTTP/1[.][01][\]r[\]n" | sed  's/\\r\\n/\n/g'
}

function cf_trace_http_resp_header() {
  ! cf_is_linux >/dev/null && echo "only works in linux" && return 1
  local pid=$1
  ! cf_is_pid_exists >/dev/null $pid && echo "pid:$pid not exists" && return 1
  strace -e write -s 2000 -qftp $pid 2>&1 | grep "HTTP/1[.][01] " | sed 's/\\r\\n/\n/g'
}

function cf_trace_http_invoke() {
  ! cf_is_linux >/dev/null && echo "only works in linux" && return 1
  local pid=$1
  ! cf_is_pid_exists >/dev/null $pid && echo "pid:$pid not exists" && return 1
  strace -e sendto -s 2000 -qftp $pid 2>&1 | grep " HTTP/1[.][01][\]r[\]n" 
}

function cf_trace_connect() {
  ! cf_is_linux >/dev/null && echo "only works in linux" && return 1
  local pid=$1
  ! cf_is_pid_exists >/dev/null $pid && echo "pid:$pid not exists" && return 1
  strace -e connect -s 2000 -qftp $pid 2>&1 | grep "port"
}

function cf_trace_socket() {
  ! cf_is_linux >/dev/null && echo "only works in linux" && return 1
  local pid=$1
  ! cf_is_pid_exists >/dev/null $pid && echo "pid:$pid not exists" && return 1
  strace -e connect,socket,close -s 2000 -qftp $pid 2>&1 | grep "port"
}

function cf_trace_sql_select() {
  ! cf_is_linux >/dev/null && echo "only works in linux" && return 1
  local pid=$1
  ! cf_is_pid_exists >/dev/null $pid && echo "pid:$pid not exists" && return 1
  strace -e sendto,write -s 2000 -qftp $pid 2>&1 | grep -i "[\]3select"
}

function cf_trace_sql_update() {
  ! cf_is_linux >/dev/null && echo "only works in linux" && return 1
  local pid=$1
  ! cf_is_pid_exists >/dev/null $pid && echo "pid:$pid not exists" && return 1
  strace -e sendto,write -s 2000 -qftp $pid 2>&1 | grep -i "[\]3update"
}

function cf_trace_sql_insert() {
  ! cf_is_linux >/dev/null && echo "only works in linux" && return 1
  local pid=$1
  ! cf_is_pid_exists >/dev/null $pid && echo "pid:$pid not exists" && return 1
  strace -e sendto,write -s 2000 -qftp $pid 2>&1 | grep -i "[\]3insert"
}

function cf_trace_redis_command() {
  ! cf_is_linux >/dev/null && echo "only works in linux" && return 1
  local pid=$1
  ! cf_is_pid_exists >/dev/null $pid && echo "pid:$pid not exists" && return 1
  local cmd=$2
  strace -e sendto,write -s 2000 -qftp $pid 2>&1 | grep -i "$cmd[\]r[\]n"
}

function cf_trace_dubbo_request() {
  ! cf_is_linux >/dev/null && echo "only works in linux" && return 1
  local pid=$1
  ! cf_is_pid_exists >/dev/null $pid && echo "pid:$pid not exists" && return 1
  strace -e read -s 2000 -qftp $pid 2>&1 | grep -i "[\]tinterface"
}

function cf_trace_dubbo_invoke() {
  ! cf_is_linux >/dev/null && echo "only works in linux" && return 1
  local pid=$1
  ! cf_is_pid_exists >/dev/null $pid && echo "pid:$pid not exists" && return 1
  strace -e write -s 2000 -qftp $pid 2>&1 | grep -i "[\]tinterface"
}

function cf_trace_system_call() {
  ! cf_is_linux >/dev/null && echo "only works in linux" && return 1
  local pid=$1
  ! cf_is_pid_exists >/dev/null $pid && echo "pid:$pid not exists" && return 1
  local time=${2:-5}

  local outfile="/tmp/.sys-call.$pid"
  strace -cqftp $pid -o $outfile & 
  local spid=$!
  while [ $time -gt 0 ]; do
    sleep 1
    let time--
    echo -n "."
  done
  echo ""
  kill $spid && echo "ok"
  # if strace process still exists
  cf_is_pid_exists $spid >/dev/null 2>&1 && kill -9 $spid
  cat $outfile && rm -f $outfile
}

function cf_random_entropy_stat() {
  ! cf_is_linux >/dev/null && echo "only works in linux" && return 1
  while true; do
    echo "entropy available:" `cat /proc/sys/kernel/random/entropy_avail`
    sleep 1
  done
}

function cf_json_fmt() {
  python -mjson.tool
}

function cf_http_server() {
  local port=${1:-8000}
  python -mSimpleHTTPServer $port 2>/dev/null
}
```