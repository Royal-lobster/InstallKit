#!/bin/bash
#
# ██╗███╗   ██╗███████╗████████╗ █████╗ ██╗     ██╗     ██╗  ██╗██╗████████╗
# ██║████╗  ██║██╔════╝╚══██╔══╝██╔══██╗██║     ██║     ██║ ██╔╝██║╚══██╔══╝
# ██║██╔██╗ ██║███████╗   ██║   ███████║██║     ██║     █████╔╝ ██║   ██║
# ██║██║╚██╗██║╚════██║   ██║   ██╔══██║██║     ██║     ██╔═██╗ ██║   ██║
# ██║██║ ╚████║███████║   ██║   ██║  ██║███████╗███████╗██║  ██╗██║   ██║
# ╚═╝╚═╝  ╚═══╝╚══════╝   ╚═╝   ╚═╝  ╚═╝╚══════╝╚══════╝╚═╝  ╚═╝╚═╝   ╚═╝
#
# InstallKit Brew Package Sync Script
#
# Usage: ./installkit-sync.sh [--short|-s] [--no-select|-n] [--help|-h]
#
# Source: https://github.com/Royal-lobster/InstallKit
# License: MIT

set -e

# Parse command line arguments
CREATE_SHORT_URL=false
SKIP_SELECTION=false

while [[ $# -gt 0 ]]; do
    case $1 in
        -s|--short)
            CREATE_SHORT_URL=true
            shift
            ;;
        -n|--no-select)
            SKIP_SELECTION=true
            shift
            ;;
        -h|--help)
            echo "InstallKit Sync - Generate shareable package lists from your Homebrew setup"
            echo
            echo "Usage: $0 [OPTIONS]"
            echo
            echo "Options:"
            echo "  -s, --short      Create a shortened URL (easier to share)"
            echo "  -n, --no-select  Skip package selection (include all packages)"
            echo "  -h, --help       Show this help message"
            echo
            echo "Controls (in package selector):"
            echo "  ↑/↓        Navigate up/down"
            echo "  SPACE      Toggle current package"
            echo "  A          Select all packages"
            echo "  N          Deselect all packages"
            echo "  ENTER      Confirm selection"
            echo "  Q          Quit without generating URL"
            echo
            exit 0
            ;;
        *)
            echo "❌ Unknown option: $1"
            echo "💡 Use --help for usage information"
            exit 1
            ;;
    esac
done

RED='\033[0;31m'
GREEN='\033[0;32m'
BLUE='\033[0;34m'
YELLOW='\033[1;33m'
NC='\033[0m'
REVERSE='\033[7m'
RESET='\033[0m'

# Interactive multiselect menu (bash 3.2 compatible)
# Args: $1=comma-separated options, $2=result variable name, $3=page size (default 15)
multiselect_menu() {
    local options_str="$1"
    local result_var="$2"
    local page_size="${3:-15}"
    
    local options=()
    local IFS_BACKUP="$IFS"
    IFS=',' read -ra options <<< "$options_str"
    IFS="$IFS_BACKUP"
    
    local num_options=${#options[@]}
    local selected=()
    local i
    
    for ((i=0; i<num_options; i++)); do
        selected+=("true")
    done
    
    local cursor=0
    local scroll_offset=0
    local visible_count=$page_size
    if [ $num_options -lt $visible_count ]; then
        visible_count=$num_options
    fi
    
    printf "\033[?25l"
    stty -echo 2>/dev/null
    
    cleanup() {
        printf "\033[?25h"
        stty echo 2>/dev/null
    }
    trap cleanup INT TERM EXIT
    
    for ((i=0; i<visible_count+3; i++)); do
        printf "\n"
    done
    
    render_menu() {
        printf "\033[%dA" "$((visible_count + 3))"
        
        printf "\033[2K${BLUE}Select packages (SPACE=toggle, A=all, N=none, ENTER=confirm, Q=quit):${NC}\n"
        
        local count=0
        for ((i=0; i<num_options; i++)); do
            if [ "${selected[$i]}" = "true" ]; then
                ((count++))
            fi
        done
        printf "\033[2K${YELLOW}Selected: $count / $num_options packages${NC}"
        if [ $num_options -gt $visible_count ]; then
            printf " ${BLUE}(showing $((scroll_offset+1))-$((scroll_offset+visible_count)) of $num_options)${NC}"
        fi
        printf "\n"
        
        for ((i=0; i<visible_count; i++)); do
            local idx=$((scroll_offset + i))
            printf "\033[2K"
            
            if [ "${selected[$idx]}" = "true" ]; then
                printf "${GREEN}[*]${NC} "
            else
                printf "[ ] "
            fi
            
            if [ $idx -eq $cursor ]; then
                printf "${REVERSE}${options[$idx]}${RESET}\n"
            else
                printf "${options[$idx]}\n"
            fi
        done
        
        printf "\033[2K\n"
    }
    
    render_menu
    
    while true; do
        local key
        IFS= read -rsn1 key 2>/dev/null
        
        if [ "$key" = $'\033' ]; then
            read -rsn2 -t 0.1 key 2>/dev/null
            case "$key" in
                '[A'|'[D')
                    if [ $cursor -gt 0 ]; then
                        ((cursor--))
                        if [ $cursor -lt $scroll_offset ]; then
                            scroll_offset=$cursor
                        fi
                    fi
                    ;;
                '[B'|'[C')
                    if [ $cursor -lt $((num_options - 1)) ]; then
                        ((cursor++))
                        if [ $cursor -ge $((scroll_offset + visible_count)) ]; then
                            scroll_offset=$((cursor - visible_count + 1))
                        fi
                    fi
                    ;;
                '[5~')
                    cursor=$((cursor - visible_count))
                    if [ $cursor -lt 0 ]; then cursor=0; fi
                    if [ $cursor -lt $scroll_offset ]; then
                        scroll_offset=$cursor
                    fi
                    ;;
                '[6~')
                    cursor=$((cursor + visible_count))
                    if [ $cursor -ge $num_options ]; then cursor=$((num_options - 1)); fi
                    if [ $cursor -ge $((scroll_offset + visible_count)) ]; then
                        scroll_offset=$((cursor - visible_count + 1))
                    fi
                    ;;
            esac
        else
            case "$key" in
                ' ')
                    if [ "${selected[$cursor]}" = "true" ]; then
                        selected[$cursor]="false"
                    else
                        selected[$cursor]="true"
                    fi
                    ;;
                'a'|'A')
                    for ((i=0; i<num_options; i++)); do
                        selected[$i]="true"
                    done
                    ;;
                'n'|'N')
                    for ((i=0; i<num_options; i++)); do
                        selected[$i]="false"
                    done
                    ;;
                'q'|'Q')
                    cleanup
                    trap - INT TERM EXIT
                    eval "$result_var=''"
                    return 1
                    ;;
                '')
                    cleanup
                    trap - INT TERM EXIT
                    
                    local result=""
                    for ((i=0; i<num_options; i++)); do
                        if [ "${selected[$i]}" = "true" ]; then
                            if [ -n "$result" ]; then
                                result="$result,${options[$i]}"
                            else
                                result="${options[$i]}"
                            fi
                        fi
                    done
                    eval "$result_var='$result'"
                    return 0
                    ;;
            esac
        fi
        
        render_menu
    done
}

if ! command -v brew &> /dev/null; then
    echo -e "${RED}❌ Error: Homebrew is not installed or not in PATH${NC}"
    echo "📥 Please install Homebrew first: https://brew.sh"
    exit 1
fi

echo -e "${BLUE}🍺 InstallKit Brew Package Detection${NC}"
echo "🔍 Scanning your installed Homebrew packages..."
echo

USERNAME=$(basename "$HOME")

echo -e "${YELLOW}📦 Detecting installed packages...${NC}"

CASKS=$(brew list --cask 2>/dev/null | tr '\n' ',' | sed 's/,$//')
FORMULAE=$(brew list --formula 2>/dev/null | tr '\n' ',' | sed 's/,$//')

ALL_PACKAGES=""
if [ -n "$CASKS" ]; then
    ALL_PACKAGES="$CASKS"
fi
if [ -n "$FORMULAE" ]; then
    if [ -n "$ALL_PACKAGES" ]; then
        ALL_PACKAGES="$ALL_PACKAGES,$FORMULAE"
    else
        ALL_PACKAGES="$FORMULAE"
    fi
fi

if [ -z "$ALL_PACKAGES" ]; then
    echo -e "${YELLOW}⚠️  No Homebrew packages found${NC}"
    echo "💡 Install some apps with Homebrew first, then run this script again"
    exit 0
fi

PACKAGE_COUNT=$(echo "$ALL_PACKAGES" | tr ',' '\n' | wc -l | tr -d ' ')
CASK_COUNT=0
FORMULA_COUNT=0
if [ -n "$CASKS" ]; then
    CASK_COUNT=$(echo "$CASKS" | tr ',' '\n' | wc -l | tr -d ' ')
fi
if [ -n "$FORMULAE" ]; then
    FORMULA_COUNT=$(echo "$FORMULAE" | tr ',' '\n' | wc -l | tr -d ' ')
fi

echo -e "${GREEN}✅ Found $PACKAGE_COUNT installed packages${NC}"
echo "📱 Casks (GUI apps): $CASK_COUNT"
echo "⚡ Formulae (CLI tools): $FORMULA_COUNT"
echo

SELECTED_PACKAGES="$ALL_PACKAGES"

if [ "$SKIP_SELECTION" = false ] && [ -t 0 ]; then
    echo -e "${BLUE}📋 Select which packages to include in your InstallKit URL:${NC}"
    echo
    
    if multiselect_menu "$ALL_PACKAGES" SELECTED_PACKAGES 15; then
        if [ -z "$SELECTED_PACKAGES" ]; then
            echo -e "${YELLOW}⚠️  No packages selected${NC}"
            exit 0
        fi
        
        SELECTED_COUNT=$(echo "$SELECTED_PACKAGES" | tr ',' '\n' | wc -l | tr -d ' ')
        echo
        echo -e "${GREEN}✅ Selected $SELECTED_COUNT packages${NC}"
    else
        echo
        echo -e "${YELLOW}👋 Cancelled by user${NC}"
        exit 0
    fi
else
    if [ "$SKIP_SELECTION" = true ]; then
        echo -e "${BLUE}📋 Including all packages (--no-select mode)${NC}"
    else
        echo -e "${BLUE}📋 Including all packages (non-interactive mode)${NC}"
    fi
fi

echo
echo -e "${BLUE}🔗 Generating your InstallKit URL...${NC}"

TITLE_ENCODED=$(printf "%s's brew packages" "$USERNAME" | sed 's/ /+/g' | sed "s/'/\%27/g")
PACKAGES_ENCODED=$(echo "$SELECTED_PACKAGES" | sed 's/,/%2C/g')

INSTALLKIT_URL="https://installkit.vercel.app?name=$TITLE_ENCODED&packages=$PACKAGES_ENCODED"

echo
echo -e "${BLUE}🔗 Your InstallKit Share URL:${NC}"
echo "$INSTALLKIT_URL"

if [ "$CREATE_SHORT_URL" = true ]; then
    echo
    echo -e "${YELLOW}🔗 Creating short URL...${NC}"
    
    create_short_url() {
        local long_url="$1"
        
        if ! command -v curl &> /dev/null; then
            return 1
        fi
        
        local response=$(curl -s -X POST "https://spoo.me/api/v1/shorten" \
            -H "Content-Type: application/json" \
            -d "{\"long_url\":\"$long_url\"}" \
            --connect-timeout 5 --max-time 10 2>/dev/null || echo "")
        
        if [ -n "$response" ]; then
            local short_url=$(echo "$response" | grep -o '"short_url":"[^"]*"' | cut -d'"' -f4)
            if [ -n "$short_url" ]; then
                echo "$short_url"
                return 0
            fi
        fi
        
        local encoded_url=$(printf '%s' "$long_url" | sed 's/:/%3A/g; s|/|%2F|g; s/?/%3F/g; s/&/%26/g; s/=/%3D/g; s/+/%2B/g; s/ /%20/g')
        response=$(curl -s "https://is.gd/create.php?format=simple&url=$encoded_url" \
            --connect-timeout 5 --max-time 10 2>/dev/null || echo "")
        
        if [ -n "$response" ] && [[ "$response" =~ ^https://is.gd/ ]]; then
            echo "$response"
            return 0
        fi
        
        return 1
    }
    
    SHORT_URL=$(create_short_url "$INSTALLKIT_URL")
    if [ $? -eq 0 ] && [ -n "$SHORT_URL" ]; then
        echo -e "${GREEN}✅ Short URL:${NC} $SHORT_URL"
    else
        echo -e "${YELLOW}⚠️  Could not create short URL${NC}"
    fi
fi

echo
echo -e "${GREEN}🎉 Done! Share your URL to help others set up their Mac.${NC}"
