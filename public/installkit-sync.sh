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
# Source: https://github.com/Royal-lobster/InstallKit
# License: MIT

set -e

#═══════════════════════════════════════════════════════════════════════════════
# CONFIGURATION & CONSTANTS
#═══════════════════════════════════════════════════════════════════════════════

# Color codes for terminal output
readonly RED='\033[0;31m'
readonly GREEN='\033[0;32m'
readonly BLUE='\033[0;34m'
readonly YELLOW='\033[1;33m'
readonly CYAN='\033[0;36m'
readonly BOLD='\033[1m'
readonly DIM='\033[2m'
readonly REVERSE='\033[7m'
readonly NC='\033[0m'
readonly RESET='\033[0m'

# Script options
CREATE_SHORT_URL=false
SKIP_SELECTION=false

#═══════════════════════════════════════════════════════════════════════════════
# COMMAND LINE ARGUMENT PARSING
#═══════════════════════════════════════════════════════════════════════════════

show_help() {
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
}

parse_arguments() {
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
                show_help
                exit 0
                ;;
            *)
                echo "❌ Unknown option: $1"
                echo "💡 Use --help for usage information"
                exit 1
                ;;
        esac
    done
}

#═══════════════════════════════════════════════════════════════════════════════
# UI FUNCTIONS
#═══════════════════════════════════════════════════════════════════════════════

print_header() {
    echo -e "${CYAN}"
    echo '  ___           _        _ _ _  ___ _   '
    echo ' |_ _|_ __  ___| |_ __ _| | | |/ (_) |_ '
    echo '  | ||  _ \/ __| __/ _` | | | |   /| __|'
    echo '  | || | | \__ \ || (_| | | |   < | |_ '
    echo ' |___|_| |_|___/\__\__,_|_|_|_|\_\_\__|'
    echo -e "${NC}"
    echo -e "${DIM}  Generate shareable Homebrew package lists${NC}"
    echo
}

#═══════════════════════════════════════════════════════════════════════════════
# INTERACTIVE MENU (Bash 3.2 Compatible)
#═══════════════════════════════════════════════════════════════════════════════

# Setup terminal for interactive input
setup_terminal() {
    printf "\033[?25l"  # Hide cursor
    stty -echo 2>/dev/null
}

# Restore terminal to normal state
restore_terminal() {
    printf "\033[?25h"  # Show cursor
    stty echo 2>/dev/null
}

# Count selected packages
count_selected() {
    local -n selected_ref=$1
    local count=0
    for item in "${selected_ref[@]}"; do
        [ "$item" = "true" ] && ((count++))
    done
    echo $count
}

# Render the interactive menu UI
render_menu() {
    local -n options_ref=$1
    local -n selected_ref=$2
    local cursor=$3
    local scroll_offset=$4
    local visible_count=$5

    local num_options=${#options_ref[@]}
    local selected_count=$(count_selected selected_ref)

    # Move cursor up to redraw
    printf "\033[%dA" "$((visible_count + 2))"

    # Header with selection count
    printf "\033[2K${BLUE}📋 Select packages${NC} ${YELLOW}($selected_count/$num_options)${NC}"
    if [ $num_options -gt $visible_count ]; then
        printf " ${BLUE}(showing $((scroll_offset+1))-$((scroll_offset+visible_count)) of $num_options)${NC}"
    fi
    printf "\n"

    # Package list with checkboxes
    for ((i=0; i<visible_count; i++)); do
        local idx=$((scroll_offset + i))
        printf "\033[2K"

        # Checkbox
        if [ "${selected_ref[$idx]}" = "true" ]; then
            printf "${GREEN}[*]${NC} "
        else
            printf "[ ] "
        fi

        # Package name (highlighted if cursor is on it)
        if [ $idx -eq $cursor ]; then
            printf "${REVERSE}${options_ref[$idx]}${RESET}\n"
        else
            printf "${options_ref[$idx]}\n"
        fi
    done

    # Footer with controls
    printf "\033[2K${NC}↑↓:navigate  SPACE:toggle  A:all  N:none  ENTER:confirm  Q:quit${NC}\n"
}

# Handle keyboard input and update state
handle_input() {
    local key=$1
    local -n cursor_ref=$2
    local -n scroll_ref=$3
    local -n selected_ref=$4
    local num_options=$5
    local visible_count=$6

    case "$key" in
        # Navigation: Up/Left
        '[A'|'[D')
            if [ ${cursor_ref} -gt 0 ]; then
                ((cursor_ref--))
                [ ${cursor_ref} -lt ${scroll_ref} ] && scroll_ref=${cursor_ref}
            fi
            ;;
        # Navigation: Down/Right
        '[B'|'[C')
            if [ ${cursor_ref} -lt $((num_options - 1)) ]; then
                ((cursor_ref++))
                [ ${cursor_ref} -ge $((scroll_ref + visible_count)) ] && \
                    scroll_ref=$((cursor_ref - visible_count + 1))
            fi
            ;;
        # Page Up
        '[5~')
            cursor_ref=$((cursor_ref - visible_count))
            [ ${cursor_ref} -lt 0 ] && cursor_ref=0
            [ ${cursor_ref} -lt ${scroll_ref} ] && scroll_ref=${cursor_ref}
            ;;
        # Page Down
        '[6~')
            cursor_ref=$((cursor_ref + visible_count))
            [ ${cursor_ref} -ge $num_options ] && cursor_ref=$((num_options - 1))
            [ ${cursor_ref} -ge $((scroll_ref + visible_count)) ] && \
                scroll_ref=$((cursor_ref - visible_count + 1))
            ;;
        # Toggle current selection
        ' ')
            if [ "${selected_ref[$cursor_ref]}" = "true" ]; then
                selected_ref[$cursor_ref]="false"
            else
                selected_ref[$cursor_ref]="true"
            fi
            ;;
        # Select all
        'a'|'A')
            for ((i=0; i<num_options; i++)); do
                selected_ref[$i]="true"
            done
            ;;
        # Deselect all
        'n'|'N')
            for ((i=0; i<num_options; i++)); do
                selected_ref[$i]="false"
            done
            ;;
    esac
}

# Main multiselect menu function
# Args: $1=comma-separated options, $2=result variable name, $3=page size (default 15)
multiselect_menu() {
    local options_str="$1"
    local result_var="$2"
    local page_size="${3:-15}"

    # Parse options into array
    local options=()
    local IFS_BACKUP="$IFS"
    IFS=',' read -ra options <<< "$options_str"
    IFS="$IFS_BACKUP"

    local num_options=${#options[@]}

    # Initialize all items as selected
    local selected=()
    for ((i=0; i<num_options; i++)); do
        selected+=("true")
    done

    # Menu state
    local cursor=0
    local scroll_offset=0
    local visible_count=$page_size
    [ $num_options -lt $visible_count ] && visible_count=$num_options

    # Check if terminal is available for interactive input
    if [ ! -r /dev/tty ]; then
        eval "$result_var='$options_str'"
        return 0
    fi

    # Setup terminal and cleanup trap
    setup_terminal
    trap restore_terminal INT TERM EXIT

    # Reserve space for menu (header + packages + footer)
    for ((i=0; i<visible_count+2; i++)); do
        printf "\n"
    done

    # Render the menu (will move cursor back up and draw everything)
    render_menu options selected $cursor $scroll_offset $visible_count

    # Main input loop
    while true; do
        IFS= read -rsn1 key 2>/dev/null < /dev/tty

        # Handle escape sequences (arrow keys, etc.)
        if [ "$key" = $'\033' ]; then
            read -rsn2 -t 0.1 key 2>/dev/null < /dev/tty
            handle_input "$key" cursor scroll_offset selected $num_options $visible_count
        else
            case "$key" in
                'q'|'Q')
                    restore_terminal
                    trap - INT TERM EXIT
                    eval "$result_var=''"
                    return 1
                    ;;
                '')  # Enter key
                    restore_terminal
                    trap - INT TERM EXIT

                    # Build result string from selected items
                    local result=""
                    for ((i=0; i<num_options; i++)); do
                        if [ "${selected[$i]}" = "true" ]; then
                            [ -n "$result" ] && result="$result,${options[$i]}" || result="${options[$i]}"
                        fi
                    done
                    eval "$result_var='$result'"
                    return 0
                    ;;
                *)
                    handle_input "$key" cursor scroll_offset selected $num_options $visible_count
                    ;;
            esac
        fi

        render_menu options selected $cursor $scroll_offset $visible_count
    done
}

#═══════════════════════════════════════════════════════════════════════════════
# URL SHORTENING
#═══════════════════════════════════════════════════════════════════════════════

# Try to create a short URL using multiple services
create_short_url() {
    local long_url="$1"

    command -v curl &> /dev/null || return 1

    # Try spoo.me first
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

    # Fallback to is.gd
    local encoded_url=$(printf '%s' "$long_url" | sed 's/:/%3A/g; s|/|%2F|g; s/?/%3F/g; s/&/%26/g; s/=/%3D/g; s/+/%2B/g; s/ /%20/g')
    response=$(curl -s "https://is.gd/create.php?format=simple&url=$encoded_url" \
        --connect-timeout 5 --max-time 10 2>/dev/null || echo "")

    if [ -n "$response" ] && [[ "$response" =~ ^https://is.gd/ ]]; then
        echo "$response"
        return 0
    fi

    return 1
}

# Generate and display short URL
generate_short() {
    local url="$1"
    echo
    echo -ne "${YELLOW}🔗 Creating short URL...${NC}"

    local short_url=$(create_short_url "$url")
    if [ $? -eq 0 ] && [ -n "$short_url" ]; then
        echo -e "\r\033[2K${GREEN}✅ Short URL:${NC} $short_url"
    else
        echo -e "\r\033[2K${YELLOW}⚠️  Could not create short URL${NC}"
    fi
}

#═══════════════════════════════════════════════════════════════════════════════
# MAIN SCRIPT LOGIC
#═══════════════════════════════════════════════════════════════════════════════

main() {
    parse_arguments "$@"
    print_header

    # Verify Homebrew is installed
    if ! command -v brew &> /dev/null; then
        echo -e "${RED}❌ Error: Homebrew is not installed or not in PATH${NC}"
        echo "📥 Please install Homebrew first: https://brew.sh"
        exit 1
    fi

    # Scan for installed packages
    echo -e "${YELLOW}📦 Scanning Homebrew packages...${NC}"

    local casks=$(brew list --cask 2>/dev/null | tr '\n' ',' | sed 's/,$//')
    local formulae=$(brew list --formula 2>/dev/null | tr '\n' ',' | sed 's/,$//')

    # Combine casks and formulae
    local all_packages=""
    [ -n "$casks" ] && all_packages="$casks"
    [ -n "$formulae" ] && all_packages="${all_packages:+$all_packages,}$formulae"

    if [ -z "$all_packages" ]; then
        echo -e "${YELLOW}⚠️  No Homebrew packages found${NC}"
        echo "💡 Install some apps with Homebrew first, then run this script again"
        exit 0
    fi

    # Display package counts
    local package_count=$(echo "$all_packages" | tr ',' '\n' | wc -l | tr -d ' ')
    local cask_count=0
    local formula_count=0
    [ -n "$casks" ] && cask_count=$(echo "$casks" | tr ',' '\n' | wc -l | tr -d ' ')
    [ -n "$formulae" ] && formula_count=$(echo "$formulae" | tr ',' '\n' | wc -l | tr -d ' ')

    echo -e "${GREEN}✅ Found $package_count installed packages${NC}"
    echo "📱 Casks (GUI apps): $cask_count"
    echo "⚡ Formulae (CLI tools): $formula_count"

    # Package selection
    local selected_packages="$all_packages"

    if [ "$SKIP_SELECTION" = false ] && [ -r /dev/tty ]; then
        echo
        if multiselect_menu "$all_packages" selected_packages 15; then
            if [ -z "$selected_packages" ]; then
                echo -e "${YELLOW}⚠️  No packages selected${NC}"
                exit 0
            fi

            local selected_count=$(echo "$selected_packages" | tr ',' '\n' | wc -l | tr -d ' ')
            echo
            echo -e "${GREEN}✅ Selected $selected_count packages${NC}"
        else
            echo
            echo -e "${YELLOW}👋 Cancelled by user${NC}"
            exit 0
        fi
    else
        echo
        local mode_text="--no-select mode"
        [ "$SKIP_SELECTION" = false ] && mode_text="non-interactive mode"
        echo -e "${BLUE}📋 Including all packages ($mode_text)${NC}"
    fi

    # Generate InstallKit URL
    local username=$(basename "$HOME")
    local title_encoded=$(printf "%s's brew packages" "$username" | sed 's/ /+/g' | sed "s/'/\%27/g")
    local packages_encoded=$(echo "$selected_packages" | sed 's/,/%2C/g')
    local installkit_url="https://installkit.vercel.app?name=$title_encoded&packages=$packages_encoded"

    echo
    echo -e "${GREEN}✅ Your InstallKit URL:${NC}"
    echo -e "${DIM}$installkit_url${NC}"

    # Handle URL shortening
    if [ "$CREATE_SHORT_URL" = true ]; then
        generate_short "$installkit_url"
    elif [ -r /dev/tty ]; then
        echo
        echo -ne "${BLUE}Generate short URL? [y/N]:${NC} "
        read -rsn1 answer < /dev/tty
        echo
        [[ "$answer" =~ ^[Yy]$ ]] && generate_short "$installkit_url"
    fi

    echo
    echo -e "${GREEN}🎉 Done! Share your URL to help others set up their Mac.${NC}"
}

# Run main function
main "$@"