!include "MUI2.nsh"

!ifndef VERSION
  !define VERSION "0.73.1"
!endif

Name "Frost Launcher"
OutFile "build\output\Frost-Launcher-Setup-${VERSION}.exe"
InstallDir "$LOCALAPPDATA\Programs\Frost Launcher"
RequestExecutionLevel user
SetCompressor /SOLID lzma

!define MUI_ICON "icons\dark.ico"
!define MUI_UNICON "icons\dark.ico"

!insertmacro MUI_PAGE_WELCOME
!insertmacro MUI_PAGE_DIRECTORY
!insertmacro MUI_PAGE_INSTFILES
!define MUI_FINISHPAGE_RUN "$INSTDIR\Frost Launcher.exe"
!define MUI_FINISHPAGE_RUN_TEXT "Launch Frost Launcher"
!insertmacro MUI_PAGE_FINISH

!insertmacro MUI_UNPAGE_CONFIRM
!insertmacro MUI_UNPAGE_INSTFILES

!insertmacro MUI_LANGUAGE "English"

Section "Install"
  SetOutPath "$INSTDIR"
  File /r "build\output\win-unpacked\*.*"
  
  CreateDirectory "$SMPROGRAMS\Frost Launcher"
  CreateShortcut "$SMPROGRAMS\Frost Launcher\Frost Launcher.lnk" "$INSTDIR\Frost Launcher.exe"
  CreateShortcut "$DESKTOP\Frost Launcher.lnk" "$INSTDIR\Frost Launcher.exe"
  
  WriteUninstaller "$INSTDIR\Uninstall.exe"
  CreateShortcut "$SMPROGRAMS\Frost Launcher\Uninstall Frost Launcher.lnk" "$INSTDIR\Uninstall.exe"
  
  WriteRegStr HKCU "Software\Microsoft\Windows\CurrentVersion\Uninstall\FrostLauncher" "DisplayName" "Frost Launcher"
  WriteRegStr HKCU "Software\Microsoft\Windows\CurrentVersion\Uninstall\FrostLauncher" "UninstallString" '"$INSTDIR\Uninstall.exe"'
  WriteRegStr HKCU "Software\Microsoft\Windows\CurrentVersion\Uninstall\FrostLauncher" "DisplayIcon" "$INSTDIR\Frost Launcher.exe"
  WriteRegStr HKCU "Software\Microsoft\Windows\CurrentVersion\Uninstall\FrostLauncher" "Publisher" "Floor Frost Creations"
  WriteRegStr HKCU "Software\Microsoft\Windows\CurrentVersion\Uninstall\FrostLauncher" "DisplayVersion" "${VERSION}"
SectionEnd

Section "Uninstall"
  RMDir /r "$INSTDIR"
  RMDir /r "$SMPROGRAMS\Frost Launcher"
  Delete "$DESKTOP\Frost Launcher.lnk"
  DeleteRegKey HKCU "Software\Microsoft\Windows\CurrentVersion\Uninstall\FrostLauncher"
SectionEnd
