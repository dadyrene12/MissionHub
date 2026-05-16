# andasy.hcl app configuration file generated for missionhub on Tuesday, 28-Apr-26 11:17:26 SAST
#
# See https://github.com/quarksgroup/andasy-cli for information about how to use this file.

app_name = "missionhub"

app {

  env = {}

  port = 80

  primary_region = "kgl"

  compute {
    cpu      = 1
    memory   = 256
    cpu_kind = "shared"
  }

  process {
    name = "missionhub"
  }

}
