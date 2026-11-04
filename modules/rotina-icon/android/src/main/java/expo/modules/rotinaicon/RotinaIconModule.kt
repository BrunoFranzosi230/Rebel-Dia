package expo.modules.rotinaicon

import android.content.ComponentName
import android.content.Context
import android.content.pm.PackageManager
import expo.modules.kotlin.exception.CodedException
import expo.modules.kotlin.modules.Module
import expo.modules.kotlin.modules.ModuleDefinition

// Troca o ícone do app no launcher. O plugin plugins/withTarotIcons.js registra um "activity-alias"
// por ícone no AndroidManifest (apenas um habilitado por vez); aqui ligamos o escolhido e
// desligamos os outros.
class RotinaIconModule : Module() {
  private val context: Context
    get() = appContext.reactContext ?: throw CodedException("Contexto do app indisponível")

  override fun definition() = ModuleDefinition {
    Name("RotinaIcon")

    AsyncFunction("setAppIcon") { key: String, keys: List<String> ->
      setAppIcon(key, keys)
    }
  }

  private fun alias(key: String): ComponentName {
    return ComponentName(context.packageName, context.packageName + ".tarot." + key)
  }

  private fun setAppIcon(key: String, keys: List<String>) {
    val manager = context.packageManager
    // liga o novo primeiro: o app nunca fica sem uma entrada no launcher
    manager.setComponentEnabledSetting(
      alias(key),
      PackageManager.COMPONENT_ENABLED_STATE_ENABLED,
      PackageManager.DONT_KILL_APP
    )
    for (other in keys) {
      if (other != key) {
        manager.setComponentEnabledSetting(
          alias(other),
          PackageManager.COMPONENT_ENABLED_STATE_DISABLED,
          PackageManager.DONT_KILL_APP
        )
      }
    }
  }
}
