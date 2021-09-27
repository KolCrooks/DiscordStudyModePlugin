
const SERVER = "816528206562590770";
const STUDY_ROLE_ID = "816910898807177237";

module.exports = (Plugin, Library) => {

    const {Patcher, Settings, DiscordModules} = Library;

    return class ExamplePlugin extends Plugin {
        
        constructor() {
            super();
            this.studyMode = false;
            this.updateFn = ()=>{};
            this.defaultSettings = {};
            this.defaultSettings.enableDms = true;
        }

        hasStudyRole(){
            return DiscordModules.GuildMemberStore.getMember(SERVER, this.userId).roles.includes(STUDY_ROLE_ID);
        }
    
        onStart() {
            console.log('STARTING STUDY MODE PLUGIN');
            this.userId = DiscordModules.UserInfoStore.getId();
            this.studyMode = this.hasStudyRole();
            this.updateFn = (e) => this.memberUpdate(e);
            DiscordModules.Dispatcher.subscribe("GUILD_MEMBER_UPDATE", this.updateFn)
            
            this.studyModeChange();
        }

        memberUpdate(info){
            console.log('UPDATE MIGHT HAPPEN', info);
            if(info.guildId != SERVER || info.user.id != this.userId) return;
            console.log('UPDATED HAPPENED');
            let t = this.studyMode;
            this.studyMode = this.hasStudyRole();
            if(this.studyMode != t) this.studyModeChange();
        }

        studyModeChange(){
            BdApi.showToast(`Study Mode ${this.studyMode ? "Enabled" : "Disabled"}`);
            const servers = document.querySelectorAll(`[data-list-item-id^="guildsnav___"]`);
            const display = this.studyMode ? "none" : "";

            for(const server of servers){
                if(server.dataset.listItemId != `guildsnav___${SERVER}`){
                    if(server.dataset.listItemId == `guildsnav___home`){
                        server.closest('.listItem-GuPuDH').style.display = (this.studyMode && this.settings.disableDms) ? "none" : "";
                    } else {
                        server.closest('.listItem-GuPuDH').style.display = display;
                    }
                }
                
            }
        }

        onStop() {
            this.studyMode = false;
            this.studyModeChange();
            DiscordModules.Dispatcher.unsubscribe("GUILD_MEMBER_UPDATE", this.updateFn)
            Patcher.unpatchAll();
        }

        getSettingsPanel() {
            return Settings.SettingPanel.build(this.saveSettings.bind(this), 
                    new Settings.Switch("Disable Dms", "Enables DMs while in study mode", this.settings.disableDms, (e) => {
                        this.settings.disableDms = e;
                        this.studyModeChange();
                    })
                );
        }
    };

};